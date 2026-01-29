'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock, TrendingUp, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const RefreshAlertsWidget = dynamic(
  () => import('@/components/refresh-alerts-widget').then(mod => ({ default: mod.RefreshAlertsWidget })),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Refresh Calendar Alerts</CardTitle>
          <CardDescription>
            Models and inputs requiring refresh
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    ),
  }
)

interface DashboardStats {
  activeModels: { value: number; change: string }
  pendingApprovals: { value: number; change: string }
  pricingRunsThisWeek: { value: number; change: string }
  overdueRefreshes: { value: number; change: string }
}

interface RecentRun {
  id: string
  customer: string
  date: string
  status: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentRuns, setRecentRuns] = useState<RecentRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [statsRes, runsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/recent-runs'),
      ])

      const statsData = await statsRes.json()
      const runsData = await runsRes.json()

      if (statsData.success) {
        setStats(statsData.stats)
      }
      if (runsData.success) {
        setRecentRuns(runsData.runs)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = stats ? [
    {
      title: 'Active Models',
      value: stats.activeModels.value.toString(),
      change: stats.activeModels.change,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals.value.toString(),
      change: stats.pendingApprovals.change,
      icon: AlertCircle,
      color: 'text-yellow-600',
    },
    {
      title: 'Pricing Runs (This Week)',
      value: stats.pricingRunsThisWeek.value.toString(),
      change: stats.pricingRunsThisWeek.change,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
    {
      title: 'Overdue Refreshes',
      value: stats.overdueRefreshes.value.toString(),
      change: stats.overdueRefreshes.change,
      icon: Clock,
      color: 'text-red-600',
    },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of pricing operations and alerts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Pricing Runs</CardTitle>
            <CardDescription>
              Latest pricing executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent pricing runs</p>
            ) : (
              <div className="space-y-4">
                {recentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{run.id}</p>
                      <p className="text-sm text-muted-foreground">{run.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{run.date}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        run.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        run.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        run.status === 'CALCULATING' ? 'bg-yellow-100 text-yellow-800' :
                        run.status === 'PUBLISHED' ? 'bg-purple-100 text-purple-800' :
                        run.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <RefreshAlertsWidget />
      </div>
    </div>
  )
}
