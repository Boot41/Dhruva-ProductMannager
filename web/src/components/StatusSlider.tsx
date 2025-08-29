import { type ChangeEvent } from 'react'

interface StatusSliderProps {
  id: string
  statuses: ReadonlyArray<string>
  value: number
  onChange: (index: number) => void
  label?: string
}

export default function StatusSlider({ id, statuses, value, onChange, label = 'Update Status' }: StatusSliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = parseInt(e.target.value, 10)
    onChange(next)
  }

  return (
    <div className="mt-4" onClick={(e) => e.stopPropagation()}>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={Math.max(0, statuses.length - 1)}
        value={value}
        onChange={handleChange}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-400"
        style={{
          background: 'linear-gradient(to right, #ef4444, #f59e0b, #22c55e)',
        }}
      />
      <div className="flex justify-between w-full text-xs mt-1">
        {statuses.map((status) => (
          <span key={status} className="capitalize text-[color:var(--color-secondary-700)]">
            {status.replace(/_/g, ' ')}
          </span>
        ))}
      </div>
      <style>{`
        /* Customize range thumb for WebKit */
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: white;
          border: 2px solid #16a34a; /* green-600 */
          box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
        }
        /* Firefox */
        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: white;
          border: 2px solid #16a34a;
          box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.2);
        }
        /* Track overrides to remove default gray */
        input[type='range']::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 9999px;
          background: transparent;
        }
        input[type='range']::-moz-range-track {
          height: 8px;
          border-radius: 9999px;
          background: transparent;
        }
      `}</style>
    </div>
  )
}
