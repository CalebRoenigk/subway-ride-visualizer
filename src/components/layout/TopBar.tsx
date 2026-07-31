import { useThemeToggle } from '../../utils/useThemeToggle'

function TrainIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="13" rx="5" />
      <path d="M4 10h16" />
      <circle cx="8.5" cy="13.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13.5" r="0.75" fill="currentColor" stroke="none" />
      <path d="M7 19l-1.5 2" />
      <path d="M17 19l1.5 2" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

export function TopBar() {
  const { isDark, toggle } = useThemeToggle()

  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        <span className="top-bar-icon">
          <TrainIcon />
        </span>
        <span className="top-bar-title">Home</span>
      </div>
      <button
        type="button"
        className="theme-toggle"
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  )
}
