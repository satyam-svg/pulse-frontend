import { Mail, Shield } from 'lucide-react'
import { Card } from '../components/ui/Card'

const rows = [
  { name: 'Alex Morgan', email: 'alex@company.com', role: 'Admin' as const },
  { name: 'Jordan Lee', email: 'jordan@company.com', role: 'Editor' as const },
  { name: 'Sam Rivera', email: 'sam@company.com', role: 'Viewer' as const },
]

export function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Users</h1>
        <p className="mt-1 text-slate-600">Admin-only directory of workspace members and roles.</p>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <Shield className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-semibold text-slate-900">Team members</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.email} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {u.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-800 ring-1 ring-violet-200/80">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
