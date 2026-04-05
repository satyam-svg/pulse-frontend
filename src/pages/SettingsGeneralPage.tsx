import { Bell, Lock, User } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'

export function SettingsGeneralPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">General</h1>
        <p className="mt-1 text-sm text-slate-600">Profile, security, and notifications.</p>
      </div>

      <Card>
        <div className="mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="display-name" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Display name
            </label>
            <Input id="display-name" defaultValue={user?.name} />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Email
            </label>
            <Input id="email" type="email" defaultValue={user?.email} />
          </div>
          <Button type="button" variant="secondary">
            Save changes
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-6 flex items-center gap-2">
          <Lock className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Security</h2>
        </div>
        <p className="text-sm text-slate-600">Rotate passwords and manage SSO in production.</p>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="new-pass" className="mb-1.5 block text-xs font-semibold text-slate-700">
              New password
            </label>
            <Input id="new-pass" type="password" placeholder="••••••••" autoComplete="new-password" />
          </div>
          <Button type="button" variant="outline">
            Update password
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-6 flex items-center gap-2">
          <Bell className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
        </div>
        <ul className="space-y-3 text-sm text-slate-700">
          <li className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
            <span>Email when a scan completes</span>
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-red-600" />
          </li>
          <li className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
            <span>Slack alerts for flagged content</span>
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-red-600" />
          </li>
        </ul>
      </Card>
    </div>
  )
}
