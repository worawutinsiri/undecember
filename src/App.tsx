import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ItemsPage } from './pages/ItemsPage'
import { RunesPage } from './pages/RunesPage'
import { SimulatorPage } from './pages/SimulatorPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/runes" element={<RunesPage />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
