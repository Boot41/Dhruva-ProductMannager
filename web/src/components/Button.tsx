import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'info'
  size?: 'sm' | 'lg'
}

export default function Button({ variant = 'primary', size, className, children, ...rest }: Props) {
  const sizeClass = size ? ` btn-${size}` : ''
  const classes = `btn btn-${variant}${sizeClass}${className ? ` ${className}` : ''}`
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
