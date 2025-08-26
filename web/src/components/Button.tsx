import type { ButtonHTMLAttributes } from 'react'
import './button.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
}

export default function Button({ variant = 'primary', children, ...rest }: Props) {
  return (
    <button className={`btn ${variant}`} {...rest}>
      {children}
    </button>
  )
}
