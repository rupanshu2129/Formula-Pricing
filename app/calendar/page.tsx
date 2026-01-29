'use client'

import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Clock, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface RefreshScheduleItem {
  id: string
  type: string
  name: string
  frequency: string
  lastRefresh: string
  nextRefresh: string
  owner: string
  status: string
}

interface CalendarStats {
  overdue: number
  dueToday: number
  upcoming: number
}

function CalendarPageContent() {
  const [refreshSchedule, setRefreshSchedule] = useState<RefreshScheduleItem[]>([])
  const [stats, setStats] = useState<CalendarStats>({ overdue: 0, dueToday: 0, upcoming: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calendar')
      const data = await response.json()

      if (data.success) {
        setRefreshSchedule(data.schedule)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refresh Calendar</h1>
          <p className="text-muted-foreground">
            Track model and input refresh schedules
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.dueToday}
            </div>
            <p className="text-xs text-muted-foreground">Action needed today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming (7 days)</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.upcoming}
            </div>
            <p className="text-xs text-muted-foreground">Plan ahead</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refresh Schedule</CardTitle>
          <CardDescription>All models and inputs requiring refresh</CardDescription>
        </CardHeader>
        <CardContent>
          {refreshSchedule.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No refresh schedules found</p>
          ) : (
            <div className="space-y-4">
              {refreshSchedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    {item.status === 'Overdue' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : item.status === 'Due Today' ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{item.name}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.frequency} • Owner: {item.owner}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last: {item.lastRefresh} • Next: {item.nextRefresh}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                    item.status === 'Due Today' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

const CalendarPage = dynamic(() => Promise.resolve(CalendarPageContent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading calendar...</p>
      </div>
    </div>
  ),
})

export default CalendarPage
