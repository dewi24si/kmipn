import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingChooser from './pages/LandingChooser'
import WargaLayout from './layouts/WargaLayout'
import Beranda from './pages/warga/Beranda'
import LaporKejadian from './pages/warga/LaporKejadian'
import CekStatus from './pages/warga/CekStatus'
import InstansiLayout from './layouts/InstansiLayout'
import ProtectedRoute from './components/instansi/ProtectedRoute'
import Login from './pages/instansi/Login'
import DashboardKomando from './pages/instansi/DashboardKomando'
import DaftarTiket from './pages/instansi/DaftarTiket'
import DetailTiket from './pages/instansi/DetailTiket'
import DashboardRekapitulasi from './pages/instansi/DashboardRekapitulasi'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingChooser />} />

        <Route path="/warga" element={<WargaLayout />}>
          <Route index element={<Beranda />} />
          <Route path="lapor" element={<LaporKejadian />} />
          <Route path="status" element={<CekStatus />} />
        </Route>

        <Route path="/instansi/login" element={<Login />} />
        <Route
          path="/instansi"
          element={
            <ProtectedRoute>
              <InstansiLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardKomando />} />
          <Route path="tiket" element={<DaftarTiket />} />
          <Route path="tiket/:id" element={<DetailTiket />} />
          <Route path="rekap" element={<DashboardRekapitulasi />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
