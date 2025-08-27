export type UmlType =
  | 'database'
  | 'load_balancer'
  | 'service'
  | 'queue'
  | 'cache'

export interface UmlComponentProps {
  // Size inputs (interpreted as desired width/height for the shape)
  x: number
  y: number
  // What this component represents; determines color and icon
  type: UmlType
  // Optional
  label?: string
  selected?: boolean
  onClick?: () => void
}

// Colors by type (kept accessible and high-contrast)
const colorByType: Record<UmlType, { fill: string; stroke: string; icon: string }> = {
  database: { fill: '#E0F2FE', stroke: '#0284C7', icon: '#0369A1' }, // sky
  load_balancer: { fill: '#ECFDF5', stroke: '#059669', icon: '#047857' }, // emerald
  service: { fill: '#EEF2FF', stroke: '#6366F1', icon: '#4F46E5' }, // indigo
  queue: { fill: '#FEF3C7', stroke: '#D97706', icon: '#B45309' }, // amber
  cache: { fill: '#FCE7F3', stroke: '#DB2777', icon: '#BE185D' }, // pink
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function UmlComponent({ x, y, type, label, selected, onClick }: UmlComponentProps) {
  // Normalize sizes. x and y act like width/height suggestions.
  const width = clamp(x || 120, 64, 320)
  const height = clamp(y || 80, 48, 240)
  const pad = 8

  const colors = colorByType[type]
  const strokeWidth = selected ? 3 : 2

  // Icon glyphs (simple, inline SVG for zero deps)
  const renderIcon = () => {
    const cx = 18
    const cy = 18
    switch (type) {
      case 'database':
        // Cylinder icon
        return (
          <g fill="none" stroke={colors.icon} strokeWidth={2}>
            <ellipse cx={cx} cy={cy - 5} rx={10} ry={4} fill="none" />
            <path d={`M ${cx - 10} ${cy - 5} v 10`} />
            <path d={`M ${cx + 10} ${cy - 5} v 10`} />
            <ellipse cx={cx} cy={cy + 5} rx={10} ry={4} fill="none" />
          </g>
        )
      case 'load_balancer':
        // Arrows/fan
        return (
          <g fill="none" stroke={colors.icon} strokeWidth={2} strokeLinecap="round">
            <path d={`M ${cx} ${cy - 8} v 16`} />
            <path d={`M ${cx - 8} ${cy} h 16`} />
            <path d={`M ${cx - 8} ${cy - 8} l 6 -6`} />
            <path d={`M ${cx + 8} ${cy - 8} l -6 -6`} />
          </g>
        )
      case 'service':
        // Gear-like simple
        return (
          <g fill="none" stroke={colors.icon} strokeWidth={2}>
            <circle cx={cx} cy={cy} r={6} />
            <path d={`M ${cx} ${cy - 11} v 4`} />
            <path d={`M ${cx} ${cy + 11} v -4`} />
            <path d={`M ${cx - 11} ${cy} h 4`} />
            <path d={`M ${cx + 11} ${cy} h -4`} />
          </g>
        )
      case 'queue':
        // Stacked docs
        return (
          <g fill="none" stroke={colors.icon} strokeWidth={2}>
            <rect x={cx - 10} y={cy - 10} width={20} height={14} rx={2} />
            <rect x={cx - 8} y={cy - 6} width={20} height={14} rx={2} />
          </g>
        )
      case 'cache':
        // Lightning bolt
        return (
          <g fill={colors.icon}>
            <path d={`M ${cx - 5} ${cy - 8} L ${cx + 2} ${cy - 8} L ${cx - 1} ${cy - 1} L ${cx + 6} ${cy - 1} L ${cx - 2} ${cy + 8} L ${cx} ${cy + 1} L ${cx - 6} ${cy + 1} Z`} />
          </g>
        )
      default:
        return null
    }
  }

  // Shape renderers (scaled to width/height)
  const renderShape = () => {
    const w = width - pad * 2
    const h = height - pad * 2

    switch (type) {
      case 'database': {
        const rx = w / 2
        const cx = pad + w / 2
        const topY = pad + 12
        const bottomY = pad + h - 12
        const ry = clamp(h * 0.12, 6, 18)
        return (
          <g>
            <rect x={pad} y={topY} width={w} height={h - 24} fill={colors.fill} stroke={colors.stroke} strokeWidth={strokeWidth} />
            <ellipse cx={cx} cy={topY} rx={rx} ry={ry} fill={colors.fill} stroke={colors.stroke} strokeWidth={strokeWidth} />
            <ellipse cx={cx} cy={bottomY} rx={rx} ry={ry} fill={colors.fill} stroke={colors.stroke} strokeWidth={strokeWidth} />
          </g>
        )
      }
      case 'load_balancer': {
        // Diamond
        const cx = pad + w / 2
        const cy = pad + h / 2
        const points = [
          `${cx},${pad}`,
          `${pad + w},${cy}`,
          `${cx},${pad + h}`,
          `${pad},${cy}`,
        ].join(' ')
        return <polygon points={points} fill={colors.fill} stroke={colors.stroke} strokeWidth={strokeWidth} />
      }
      case 'service': {
        // Rounded rectangle
        const r = clamp(Math.min(w, h) * 0.15, 6, 16)
        return <rect x={pad} y={pad} width={w} height={h} rx={r} fill={colors.fill} stroke={colors.stroke} strokeWidth={strokeWidth} />
      }
      case 'queue': {
        // Stacked rounded rects
        const r = 8
        const gap = 6
        const slice = (h - gap) / 2
        return (
          <g>
            <rect x={pad} y={pad} width={w} height={slice} rx={r} fill={colors.fill} stroke={colors.stroke} strokeWidth={strokeWidth} />
            <rect x={pad} y={pad + slice + gap} width={w} height={slice} rx={r} fill={colors.fill} stroke={colors.stroke} strokeWidth={strokeWidth} />
          </g>
        )
      }
      case 'cache': {
        // Hexagon
        const cx = pad + w / 2
        const cy = pad + h / 2
        const rw = w / 2
        const points = [
          `${cx - rw * 0.5},${pad}`,
          `${cx + rw * 0.5},${pad}`,
          `${pad + w},${cy}`,
          `${cx + rw * 0.5},${pad + h}`,
          `${cx - rw * 0.5},${pad + h}`,
          `${pad},${cy}`,
        ].join(' ')
        return <polygon points={points} fill={colors.fill} stroke={colors.stroke} strokeWidth={strokeWidth} />
      }
      default:
        return null
    }
  }

  // Layout
  const svgWidth = width
  const svgHeight = height

  return (
    <div
      role="button"
      onClick={onClick}
      style={{ width: svgWidth, height: svgHeight, display: 'inline-block', cursor: onClick ? 'pointer' : 'default' }}
      aria-label={label || type}
    >
      <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
        {/* Shape */}
        {renderShape()}

        {/* Icon bubble */}
        <g transform={`translate(${svgWidth - 44}, 8)`}>
          <rect x={0} y={0} width={36} height={36} rx={9} fill="#fff" opacity={0.9} />
          {renderIcon()}
        </g>

        {/* Label */}
        {label && (
          <text
            x={svgWidth / 2}
            y={svgHeight - 10}
            textAnchor="middle"
            fontSize={12}
            fill="#111827"
            style={{ userSelect: 'none' }}
          >
            {label}
          </text>
        )}

        {/* Selection ring */}
        {selected && (
          <rect x={1} y={1} width={svgWidth - 2} height={svgHeight - 2} rx={10} fill="none" stroke="#0EA5E9" strokeWidth={1.5} strokeDasharray="4 4" />
        )}
      </svg>
    </div>
  )
}
