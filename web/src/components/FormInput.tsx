import type { InputHTMLAttributes } from 'react'
import './forminput.css'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string
  onChange: (value: string) => void
}

export default function FormInput({ label, onChange, ...rest }: Props) {
  return (
    <label className="fi-root">
      <span className="fi-label">{label}</span>
      <input
        className="fi-input"
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </label>
  )
}
