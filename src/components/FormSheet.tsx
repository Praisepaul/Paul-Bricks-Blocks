import type { PropsWithChildren } from 'react'
import { Button } from './Button'
import { Icon } from './Icon'

type FormSheetProps = PropsWithChildren<{
  title: string
  onClose: () => void
}>

export function FormSheet({ title, onClose, children }: FormSheetProps) {
  return (
    <div className="form-sheet-backdrop" role="presentation" onClick={onClose}>
      <section className="form-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="form-sheet-heading">
          <h3>{title}</h3>
          <Button variant="icon" type="button" aria-label="Close" onClick={onClose}><Icon name="close" size={18} /></Button>
        </div>
        {children}
      </section>
    </div>
  )
}
