import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from './components/AdminRoute'
import { EditorRoute } from './components/EditorRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { SettingsLayout } from './components/layout/SettingsLayout'
import { GuestRoute } from './components/GuestRoute'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { UploadProgressProvider } from './context/UploadProgressContext'
import { DashboardHome } from './pages/DashboardHome'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { ProcessingStatusPage } from './pages/ProcessingStatusPage'
import { SettingsGeneralPage } from './pages/SettingsGeneralPage'
import { SignupPage } from './pages/SignupPage'
import { UploadPage } from './pages/UploadPage'
import { UsersPage } from './pages/UsersPage'
import { VideoLibraryPage } from './pages/VideoLibraryPage'
import { VideoPlayerPage } from './pages/VideoPlayerPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<SettingsGeneralPage />} />
          <Route
            path="upload"
            element={
              <EditorRoute>
                <UploadPage />
              </EditorRoute>
            }
          />
          <Route path="processing" element={<ProcessingStatusPage />} />
          <Route path="library" element={<VideoLibraryPage />} />
          <Route
            path="users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
        </Route>
        <Route path="video/:id" element={<VideoPlayerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <UploadProgressProvider>
          <AppErrorBoundary>
            <AppRoutes />
          </AppErrorBoundary>
        </UploadProgressProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
