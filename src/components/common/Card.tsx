import type { ReactNode } from 'react'
import './card.css'

interface CardProps {
  title?: ReactNode
  meta?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, meta, children, className }: CardProps) {
  return (
    <section className={['card', className].filter(Boolean).join(' ')}>
      {(title || meta) && (
        <header className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {meta && <div className="card-meta">{meta}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
