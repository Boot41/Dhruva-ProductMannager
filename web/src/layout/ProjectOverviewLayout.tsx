import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import UmlComponent, { type UmlType } from '../components/UmlComponent'
import { getProjectUMLs, type ProjectUML } from '../Api/projects'

export type UmlNode = {
  id: string | number
  type: UmlType
  x: number
  y: number
  w?: number
  h?: number
  label?: string
}

function normalizeSchema(schema: any): UmlNode[] {
  const raw = Array.isArray(schema?.nodes)
    ? schema.nodes
    : Array.isArray(schema)
    ? schema
    : []

  const nodes: UmlNode[] = []
  for (const n of raw) {
    if (!n) continue
    const type: UmlType | undefined = n.type
    if (!type) continue
    nodes.push({
      id: n.id ?? Math.random().toString(36).slice(2),
      type,
      x: Number(n.x ?? n.left ?? 40) || 40,
      y: Number(n.y ?? n.top ?? 40) || 40,
      w: Number(n.w ?? n.width ?? 140) || 140,
      h: Number(n.h ?? n.height ?? 96) || 96,
      label: typeof n.label === 'string' ? n.label : undefined,
    })
  }
  return nodes
}

export default function ProjectOverviewLayout() {
  const { projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nodes, setNodes] = useState<UmlNode[]>([])
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load UML')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [projectId])

  const onPointerDown = (e: React.PointerEvent, id: UmlNode['id']) => {
    const canvas = canvasRef.current
    if (!canvas) return
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

  const onPointerUp = (e: React.PointerEvent) => {
    if (draggingRef.current.id) {
      draggingRef.current = { id: null, offsetX: 0, offsetY: 0 }
      ;(e.target as Element).releasePointerCapture?.(e.pointerId)
    }
  }

  const canvasContent = useMemo(() => {
    return (
      <div
        ref={canvasRef}
        className="relative w-full h-[70vh] bg-white border border-[color:var(--color-secondary-200)] rounded-lg overflow-hidden"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {nodes.map((n) => (
          <div
            key={n.id}
            style={{ position: 'absolute', left: n.x, top: n.y }}
            onPointerDown={(e) => onPointerDown(e, n.id)}
          >
            <UmlComponent
              x={n.w ?? 140}
              y={n.h ?? 96}
              type={n.type}
              label={n.label}
              selected={selectedId === n.id}
              onClick={() => setSelectedId(n.id)}
            />
          </div>
        ))}
      </div>
    )
  }, [nodes, selectedId])

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
      {canvasContent}
    </div>
  )
}
