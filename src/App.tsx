import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Overview } from './pages/Overview'
import { Timeline } from './pages/Timeline'
import { Lines } from './pages/Lines'
import { Lookup } from './pages/Lookup'
import { RollingStock } from './pages/RollingStock'
import { Achievements } from './pages/Achievements'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/lines" element={<Lines />} />
          <Route path="/rolling-stock" element={<RollingStock />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/achievements" element={<Achievements />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
