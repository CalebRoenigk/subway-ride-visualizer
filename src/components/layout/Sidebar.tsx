import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/timeline', label: 'Timeline' },
  { to: '/lines', label: 'Lines' },
  { to: '/rolling-stock', label: 'Rolling Stock' },
  { to: '/lookup', label: 'Lookup' },
  { to: '/achievements', label: 'Achievements' },
]

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Primary">
      <ul className="sidebar-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'sidebar-link sidebar-link--active' : 'sidebar-link'
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
