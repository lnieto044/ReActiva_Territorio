import { Navigate, Route, Routes } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { AppFooter } from './components/AppFooter';
import { SyncStatusBanner } from './components/SyncStatusBanner';
import { RequireAuth } from './components/RequireAuth';
import { RequireRole } from './components/RequireRole';
import { LandingPage } from './pages/LandingPage';
import { PrivacidadPage } from './pages/PrivacidadPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ReporteFormPage } from './pages/ReporteFormPage';
import { MapaPage } from './pages/MapaPage';
import { CasoDetallePage } from './pages/CasoDetallePage';
import { OfertasPage } from './pages/OfertasPage';
import { CoincidenciasPage } from './pages/CoincidenciasPage';
import { SeguimientoListPage, SeguimientoDetallePage } from './pages/SeguimientoPage';
import { TableroPage } from './pages/TableroPage';
import { GestionUsuariosPage } from './pages/GestionUsuariosPage';
import { AlertasPage } from './pages/AlertasPage';
import { SeguridadPage } from './pages/SeguridadPage';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <SyncStatusBanner />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <AppFooter />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacidad" element={<PrivacidadPage />} />

      <Route
        path="/panel"
        element={
          <RequireAuth>
            <AppShell>
              <DashboardPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/reportar"
        element={
          <RequireAuth>
            <AppShell>
              <ReporteFormPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/mapa"
        element={
          <RequireAuth>
            <AppShell>
              <MapaPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/casos/:id"
        element={
          <RequireAuth>
            <AppShell>
              <CasoDetallePage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/ofertas"
        element={
          <RequireAuth>
            <AppShell>
              <OfertasPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/coincidencias"
        element={
          <RequireAuth>
            <AppShell>
              <CoincidenciasPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/seguimiento"
        element={
          <RequireAuth>
            <AppShell>
              <SeguimientoListPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/seguimiento/:matchId"
        element={
          <RequireAuth>
            <AppShell>
              <SeguimientoDetallePage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/tablero"
        element={
          <RequireAuth>
            <AppShell>
              <TableroPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/alertas"
        element={
          <RequireAuth>
            <AppShell>
              <AlertasPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/seguridad"
        element={
          <RequireAuth>
            <AppShell>
              <SeguridadPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/usuarios"
        element={
          <RequireAuth>
            <AppShell>
              <RequireRole allow={(role) => role === 'admin'} mensaje="La gestión de usuarios es solo para el equipo de coordinación.">
                <GestionUsuariosPage />
              </RequireRole>
            </AppShell>
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
