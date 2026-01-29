'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RefreshAlert {
  model: string
  dueDate: string
  overdue: boolean
}

export function RefreshAlertsWidget() {
  const [refreshAlerts, setRefreshAlerts] = useState<RefreshAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRefreshAlerts()
  }, [])

  const fetchRefreshAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/refresh-alerts')
      const data = await response.json()

      if (data.success) {
        setRefreshAlerts(data.alerts)
      }
    } catch (error) {
      console.error('Error fetching refresh alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
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
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Refresh Calendar Alerts</CardTitle>
        <CardDescription>
          Models and inputs requiring refresh
        </CardDescription>
      </CardHeader>
      <CardContent>
        {refreshAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No refresh alerts</p>
        ) : (
          <div className="space-y-4">
            {refreshAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-2">
                  {alert.overdue ? (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{alert.model}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {alert.dueDate}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  alert.overdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.overdue ? 'Overdue' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
