import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { useParams } from 'react-router-dom'
import UmlComponent, { type UmlType } from '../components/UmlComponent'
import { getProjectUMLs, type ProjectUML, updateProjectUML } from '../Api/projects'
import AddNodeDialog, { type AddNodeData } from '../components/AddNodeDialog'
import AddRelationshipDialog, { type AddRelationshipData } from '../components/AddRelationshipDialog'
import ChatBubble from '../components/ChatBubble'
import { getCurrentUser, type User } from '../Api/auth'
import ProjectFeatures from '../components/ProjectFeatures'

export type UmlNode = {
  id: string | number
  type: UmlType
  x: number
  y: number
  w?: number
  h?: number
  label?: string
}

export type UmlRelationship = {
  source: string | number
  to: string | number
  type?: string
}

function normalizeSchema(schema: any): UmlNode[] {
  const raw = Array.isArray(schema?.nodes)
    ? schema.nodes
    : Array.isArray(schema)
    ? schema
    : []

  const nodes: UmlNode[] = []
  raw.forEach((n: any, idx: number) => {
    if (!n) return
    const type: UmlType | undefined = n.type
    if (!type) return

    const hasCoords = n.x != null || n.y != null || n.left != null || n.top != null

    // default spacing
    const spacingX = 220
    const spacingY = 160
    const colCount = 4 // wrap every 4 items

    const x = hasCoords
      ? Number(n.x ?? n.left ?? 40)
      : 40 + (idx % colCount) * spacingX

    const y = hasCoords
      ? Number(n.y ?? n.top ?? 40)
      : 40 + Math.floor(idx / colCount) * spacingY

    nodes.push({
      id: n.id ?? Math.random().toString(36).slice(2),
      type,
      x,
      y,
      w: Number(n.w ?? n.width ?? 140) || 140,
      h: Number(n.h ?? n.height ?? 96) || 96,
      label: typeof n.label === 'string' ? n.label : undefined,
    })
  })
  return nodes
}


function normalizeRelationships(schema: any): UmlRelationship[] {
  const raw = Array.isArray(schema?.relationships) ? schema.relationships : []
  const rels: UmlRelationship[] = []
  for (const r of raw) {
    if (!r) continue
    if (r.source == null || r.to == null) continue
    rels.push({ source: r.source, to: r.to, type: r.type })
  }
  return rels
}

export default function ProjectOverviewLayout() {
  const { projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nodes, setNodes] = useState<UmlNode[]>([])
  const [relationships, setRelationships] = useState<UmlRelationship[]>([])
  const [selectedId, setSelectedId] = useState<string | number | null>(null)
  const [moveEnabled, setMoveEnabled] = useState<boolean>(false)
  const [currentUml, setCurrentUml] = useState<ProjectUML | null>(null)
  const [addNodeOpen, setAddNodeOpen] = useState(false)
  const [addRelOpen, setAddRelOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // drag state
  const draggingRef = useRef<{
    id: string | number | null
    offsetX: number
    offsetY: number
  }>({ id: null, offsetX: 0, offsetY: 0 })
  const canvasRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function load() {
      if (!projectId) return
      try {
        setLoading(true)
        setError(null)
        const umls: ProjectUML[] = await getProjectUMLs(Number(projectId))
        const first = umls?.[0]
        const parsed = normalizeSchema(first?.uml_schema)
        setNodes(parsed)
        setRelationships(normalizeRelationships(first?.uml_schema))
        setCurrentUml(first ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load UML')
      } finally {
        setLoading(false)
      }
    }
    load()
    loadCurrentUser()
  }, [projectId])

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser()
      setCurrentUser(user)
    } catch (err) {
      console.error('Error loading current user:', err)
    }
  }

  const onPointerDown = (e: React.PointerEvent, id: UmlNode['id']) => {
    const canvas = canvasRef.current
    if (!canvas) return
    // If move is disabled, only select without starting drag
    if (!moveEnabled) {
      setSelectedId(id)
      return
    }
    const rect = canvas.getBoundingClientRect()
    // Find current node position
    const n = nodes.find((x) => x.id === id)
    if (!n) return
    const pointerX = e.clientX - rect.left
    const pointerY = e.clientY - rect.top
    draggingRef.current = {
      id,
      offsetX: pointerX - n.x,
      offsetY: pointerY - n.y,
    }
    setSelectedId(id)
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    const dragging = draggingRef.current
    if (!canvas || !dragging.id) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - dragging.offsetX
    const y = e.clientY - rect.top - dragging.offsetY

    setNodes((prev) =>
      prev.map((n) =>
        n.id === dragging.id
          ? {
              ...n,
              x: Math.max(0, Math.min(x, rect.width - (n.w ?? 140))),
              y: Math.max(0, Math.min(y, rect.height - (n.h ?? 96))),
            }
          : n,
      ),
    )
  }

  const onPointerUp = async (e: React.PointerEvent) => {
    if (draggingRef.current.id) {
      draggingRef.current = { id: null, offsetX: 0, offsetY: 0 }
      ;(e.target as Element).releasePointerCapture?.(e.pointerId)
      // No persistence here; saving happens only via the button click.
    }
  }
  
  const persistSchema = async (nextNodes: UmlNode[], nextRelationships: UmlRelationship[]) => {
    if (!projectId || !currentUml) return
    const updatedSchema = {
      nodes: nextNodes.map(n => ({
        id: n.id,
        name: n.label ?? n.id,
        type: n.type,
        description: "",
        x: n.x,
        y: n.y,
        w: n.w,
        h: n.h,
      })),
      relationships: nextRelationships,
    }
    await updateProjectUML(currentUml.id, {
      project_id: Number(projectId),
      type: currentUml.type,
      uml_schema: updatedSchema,
    })
  }

  const handleAddNodeSubmit = async (data: AddNodeData) => {
    try {
      setSaving(true)
      setDialogError(null)
      const newNode: UmlNode = {
        id: data.id || data.name,
        type: data.type as UmlType,
        x: data.x,
        y: data.y,
        w: data.w,
        h: data.h,
        label: data.name,
      }
      const nextNodes = [...nodes, newNode]
      setNodes(nextNodes)
      await persistSchema(nextNodes, relationships)
      setAddNodeOpen(false)
    } catch (e: any) {
      setDialogError(e?.message || 'Failed to add node')
    } finally {
      setSaving(false)
    }
  }

  const handleAddRelationshipSubmit = async (data: AddRelationshipData) => {
    try {
      setSaving(true)
      setDialogError(null)
      const nextRelationships = [...relationships, { source: data.source, to: data.to, type: data.type }]
      setRelationships(nextRelationships)
      await persistSchema(nodes, nextRelationships)
      setAddRelOpen(false)
    } catch (e: any) {
      setDialogError(e?.message || 'Failed to add relationship')
    } finally {
      setSaving(false)
    }
  }


  const canvasContent = useMemo(() => {
    // quick lookup for node center positions
    const nodeById = new Map<string | number, UmlNode>()
    nodes.forEach((n) => nodeById.set(n.id, n))

    return (
      <div
        ref={canvasRef}
        className="relative w-full h-[70vh] bg-white border border-[color:var(--color-secondary-200)] rounded-lg overflow-hidden"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Edges layer (under nodes) */}
        <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
            <marker id="arrowhead-strong" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
              <polygon points="0 0, 12 4, 0 8" fill="#0ea5e9" />
            </marker>
          </defs>
          {relationships.map((r, idx) => {
            const from = nodeById.get(r.source)
            const to = nodeById.get(r.to)
            if (!from || !to) return null
            const fx = from.x + (from.w ?? 140) / 2
            const fy = from.y + (from.h ?? 96) / 2
            const tx = to.x + (to.w ?? 140) / 2
            const ty = to.y + (to.h ?? 96) / 2
            const stroke = r.type === 'reads_writes' ? '#0ea5e9' : '#64748b'
            const marker = r.type === 'reads_writes' ? 'url(#arrowhead-strong)' : 'url(#arrowhead)'
            return (
              <line
                key={idx}
                x1={fx}
                y1={fy}
                x2={tx}
                y2={ty}
                stroke={stroke}
                strokeWidth={2}
                markerEnd={marker}
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>
        {nodes.map((n) => (
          <div
            key={n.id}
            style={{ position: 'absolute', left: n.x, top: n.y, cursor: moveEnabled ? 'move' : 'default' }}
            onPointerDown={(e) => onPointerDown(e, n.id)}
          >
            <UmlComponent
              x={n.w ?? 140}
              y={n.h ?? 96}
              type={n.type}
              id={String(n.id)}
              name={String(n.id)}
              label={n.label}
              selected={selectedId === n.id}
              onClick={() => setSelectedId(n.id)}
            />
          </div>
        ))}
      </div>
    )
  }, [nodes, selectedId, relationships, moveEnabled])

  if (loading) {
    return <div className="text-[color:var(--color-secondary-600)]">Loading UML...</div>
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="w-full px-4">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold text-[color:var(--color-secondary-900)]">Project Overview</h2>
        <p className="text-[color:var(--color-secondary-600)]">Drag and arrange your system components</p>
      </div>
      <div className="mb-2 flex items-center justify-between gap-2">
        {currentUser?.role === 'owner' && (
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded border border-[color:var(--color-secondary-300)] text-[color:var(--color-secondary-800)] hover:bg-[color:var(--color-secondary-50)]"
              onClick={() => setAddNodeOpen(true)}
              disabled={!currentUml}
            >
              Add Node
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded border border-[color:var(--color-secondary-300)] text-[color:var(--color-secondary-800)] hover:bg-[color:var(--color-secondary-50)]"
              onClick={() => setAddRelOpen(true)}
              disabled={!currentUml || nodes.length < 2}
            >
              Add Relationship
            </button>
          </div>
        )}
        {currentUser?.role === 'owner' && (
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded border border-[color:var(--color-secondary-300)] text-[color:var(--color-secondary-800)] hover:bg-[color:var(--color-secondary-50)]"
            onClick={async () => {
              // Save only when disabling move
              if (moveEnabled) {
                try {
                  if (!projectId || !currentUml) {
                    setMoveEnabled((v) => !v)
                    return
                  }
                  const updatedSchema = {
                    nodes: nodes.map(n => ({
                      id: n.id,
                      name: n.label ?? n.id,
                      type: n.type,
                      description: "",
                      x: n.x,
                      y: n.y,
                      w: n.w,
                      h: n.h,
                    })),
                    relationships
                  }
                  await updateProjectUML(currentUml.id, {
                    project_id: Number(projectId),
                    type: currentUml.type,
                    uml_schema: updatedSchema,
                  })
                } catch (err) {
                  console.error('Failed to save UML on button click', err)
                }
              }
              setMoveEnabled((v) => !v)
            }}
            aria-pressed={moveEnabled}
          >
            {moveEnabled ? 'Disable Move' : 'Enable Move'}
          </button>
        )}
      </div>
      {canvasContent}

      <div className="mt-8">
        {projectId && <ProjectFeatures projectId={Number(projectId)} />}
      </div>

      <AddNodeDialog
        open={addNodeOpen}
        saving={saving}
        error={dialogError}
        onCancel={() => setAddNodeOpen(false)}
        onSubmit={handleAddNodeSubmit}
      />

      <AddRelationshipDialog
        open={addRelOpen}
        nodeIds={nodes.map(n => String(n.id))}
        saving={saving}
        error={dialogError}
        onCancel={() => setAddRelOpen(false)}
        onSubmit={handleAddRelationshipSubmit}
      />
      <ChatBubble />
    </div>
  )
}
