import { Activity, Library, Upload, User, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const subNav =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150'
const subInactive = 'text-slate-700 hover:bg-slate-100'
const subActive = 'bg-slate-100 text-slate-900 font-semibold'

export function SettingsLayout() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const canUpload = user?.role === 'editor' || user?.role === 'admin'

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${subNav} ${isActive ? subActive : subInactive}`

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:gap-10">
      <aside className="shrink-0 lg:w-56">
        <p className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:block">
          Settings
        </p>
        <nav className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          <NavLink to="/app/settings" end className={linkClass}>
            <User className="h-4 w-4 shrink-0 text-slate-500" />
            General
          </NavLink>
          {canUpload && (
            <NavLink to="/app/settings/upload" className={linkClass}>
              <Upload className="h-4 w-4 shrink-0 text-slate-500" />
              Upload video
            </NavLink>
          )}
          <NavLink to="/app/settings/processing" className={linkClass}>
            <Activity className="h-4 w-4 shrink-0 text-slate-500" />
            Processing
          </NavLink>
          <NavLink to="/app/settings/library" className={linkClass}>
            <Library className="h-4 w-4 shrink-0 text-slate-500" />
            Library (table)
          </NavLink>
          {isAdmin && (
            <NavLink to="/app/settings/users" className={linkClass}>
              <Users className="h-4 w-4 shrink-0 text-slate-500" />
              Users
            </NavLink>
          )}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
