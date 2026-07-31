import { useThemeToggle } from '../../utils/useThemeToggle'

function TrainIcon() {
  return (
    <svg width="21" height="20" viewBox="0 0 48 46" fill="currentColor" aria-hidden="true">
      <path d="M21.7775 2.68062C25.981 2.48571 31.9612 2.80638 35.968 4.20406C36.885 4.58365 37.9154 5.22168 38.6486 5.88179C41.0947 8.08435 40.7474 11.9068 40.7463 14.8076L40.7424 22.205L40.7453 28.1298C40.746 29.1674 40.7872 30.2377 40.7072 31.2695C40.3861 35.409 37.4055 38.1724 33.3605 38.4736C34.303 39.3937 35.5823 40.6133 36.4328 41.582L36.4455 42.6259C32.95 42.6745 29.3847 42.6408 25.884 42.6406L16.7863 42.6425C14.9868 42.6444 13.0904 42.6769 11.2971 42.6289L11.298 41.58C12.32 40.5312 13.3522 39.4923 14.3947 38.4638C10.3756 38.2388 7.21757 35.233 7.03242 31.1015C6.96335 29.5609 7.02424 27.9565 7.02558 26.4101L7.02753 17.7597L7.0246 13.1201C7.02344 12.05 6.98543 10.9702 7.12519 9.91109C7.47638 7.25044 9.31245 5.08148 11.841 4.18843C14.8178 3.13719 18.6183 2.76782 21.7775 2.68062ZM17.6643 30.5791C17.3956 28.8546 15.776 27.6773 14.0529 27.9541C12.3414 28.229 11.1739 29.836 11.4406 31.5488C11.7076 33.2615 13.3087 34.4363 15.0227 34.1777C16.7481 33.9172 17.9327 32.3034 17.6643 30.5791ZM36.5353 30.5683C36.2622 28.8478 34.6427 27.677 32.923 27.956C31.2121 28.2338 30.048 29.8427 30.3195 31.5546C30.5912 33.2667 32.1964 34.4364 33.9094 34.1709C35.631 33.9039 36.8084 32.289 36.5353 30.5683ZM11.34 21.5878C14.8218 21.6194 18.4302 21.531 21.8889 21.6025L21.8977 11.122L11.3459 11.1171L11.34 21.5878ZM26.0891 21.5976C29.5331 21.5974 33.1268 21.5425 36.5578 21.6025L36.5637 11.1211L26.0891 11.1132V21.5976Z" />
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
