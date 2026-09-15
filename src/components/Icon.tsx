import type { SVGProps } from 'react'

type IconName = 'home' | 'sales' | 'stock' | 'accounts' | 'more' | 'user' | 'close' | 'chevron'

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...props }

  if (name === 'home') return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5" /><path d="M9.5 21v-6h5v6" /></svg>
  if (name === 'sales') return <svg {...common}><path d="M5 19 19 5" /><path d="M8 5h11v11" /><path d="M5 9V5h4" /></svg>
  if (name === 'stock') return <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
  if (name === 'accounts') return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M14.5 9.5c-.7-.7-1.6-1-2.6-1-1.3 0-2.2.7-2.2 1.7 0 2.5 4.8 1 4.8 3.7 0 1-.9 1.7-2.3 1.7-1.1 0-2.1-.4-2.8-1.1M12 6.8v10.4" /></svg>
  if (name === 'more') return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c.8-3.3 3-5 6.5-5s5.7 1.7 6.5 5" /></svg>
  if (name === 'close') return <svg {...common}><path d="m7 7 10 10M17 7 7 17" /></svg>
  return <svg {...common}><path d="m8 10 4 4 4-4" /></svg>
}
