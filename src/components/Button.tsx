import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'active' | 'nav'

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: ButtonVariant
}

export function Button({ children, variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
