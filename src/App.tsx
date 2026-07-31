import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Overview } from './pages/Overview'
import { Timeline } from './pages/Timeline'
import { Lines } from './pages/Lines'
import { ComingSoon } from './pages/ComingSoon'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/lines" element={<Lines />} />
          <Route
            path="/rolling-stock"
            element={<ComingSoon title="Rolling Stock" />}
          />
          <Route path="/lookup" element={<ComingSoon title="Lookup" />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
