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

export function TopBar() {
  return (
    <header className="top-bar">
      <span className="top-bar-icon">
        <TrainIcon />
      </span>
      <span className="top-bar-title">Home</span>
    </header>
  )
}
