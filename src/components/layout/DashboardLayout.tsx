import { Home, Menu, Mic, Plus, Search, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItem =
  'flex items-center gap-5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150'
const navIdle = 'text-slate-800 hover:bg-slate-100'
const navOn = 'bg-slate-100 text-slate-900 font-semibold'

export type DashboardOutletContext = {
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const canUpload = user?.role === 'editor' || user?.role === 'admin'
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const outletContext: DashboardOutletContext = { searchQuery, setSearchQuery }

  return (
    <div className="min-h-svh bg-[#f9f9f9]">
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-hidden
        onClick={() => setMobileOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] border-r border-slate-200/90 bg-white transition-transform duration-200 ease-out lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-14 items-center gap-2 px-3 pt-2">
          <button
            type="button"
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:pointer-events-none lg:opacity-0 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
          <NavLink
            to="/app"
            className="flex flex-1 items-center gap-1.5 px-1"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff0000] text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4 translate-x-px" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">VSPlayer</span>
          </NavLink>
        </div>

        <nav className="mt-2 flex flex-col gap-0.5 px-3 pb-4">
          <NavLink
            to="/app"
            end
            className={({ isActive }) => `${navItem} ${isActive ? navOn : navIdle}`}
            onClick={() => setMobileOpen(false)}
          >
            <Home className="h-6 w-6 shrink-0 text-slate-700" />
            Home
          </NavLink>
          <NavLink
            to="/app/settings"
            className={({ isActive }) => `${navItem} ${isActive ? navOn : navIdle}`}
            onClick={() => setMobileOpen(false)}
          >
            <Settings className="h-6 w-6 shrink-0 text-slate-700" />
            Settings
          </NavLink>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-100 p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
              {(user?.name ?? 'U').slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{user?.name}</span>
              <span className="block truncate text-xs text-slate-500">Sign out</span>
            </span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200/90 bg-white px-2 sm:px-4">
          <button
            type="button"
            className="rounded-full p-2.5 text-slate-700 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="mx-auto flex max-w-[640px] flex-1 items-center gap-2">
            <div className="relative flex min-w-0 flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="search"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border border-slate-200 bg-[#f9f9f9] py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-500 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <button
              type="button"
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 sm:flex"
              aria-label="Voice search"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>

          {canUpload && (
            <>
              <NavLink
                to="/app/settings/upload"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200 sm:hidden"
                aria-label="Upload video"
              >
                <Plus className="h-6 w-6" />
              </NavLink>
              <NavLink
                to="/app/settings/upload"
                className="hidden shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:inline-flex"
              >
                Create
              </NavLink>
            </>
          )}
        </header>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet context={outletContext} />
        </main>
      </div>
    </div>
  )
}
