import type { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label: string
  onChange: (value: string) => void
}

export default function FormInput({ label, onChange, ...rest }: Props) {
  return (
    <label className="form-group">
      <span className="label">{label}</span>
      <input
        className="input"
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </label>
  )
}
