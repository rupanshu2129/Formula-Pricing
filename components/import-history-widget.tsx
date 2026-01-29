'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ImportHistoryItem {
  id: string
  fileName: string
  uploadedAt: string
  uploadedBy: string
  status: string
  recordsProcessed: number
  recordsSuccess: number
  recordsFailed: number
  errorDetails?: any
  duration: number | null
}

export function ImportHistoryWidget() {
  const [importHistory, setImportHistory] = useState<ImportHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImportHistory()
  }, [])

  const fetchImportHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/imports')
      const data = await response.json()

      if (data.success) {
        setImportHistory(data.history)
      }
    } catch (error) {
      console.error('Error fetching import history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'PARTIAL':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>Previous file uploads and their status</CardDescription>
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
        <CardTitle>Import History</CardTitle>
        <CardDescription>Previous file uploads and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {importHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No import history found</p>
        ) : (
          <div className="space-y-4">
            {importHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-medium">{item.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {formatDate(item.uploadedAt)} by {item.uploadedBy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.recordsProcessed} records processed
                      {item.recordsSuccess > 0 && ` • ${item.recordsSuccess} success`}
                      {item.recordsFailed > 0 && ` • ${item.recordsFailed} failed`}
                      {item.duration && ` • ${item.duration}s`}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
