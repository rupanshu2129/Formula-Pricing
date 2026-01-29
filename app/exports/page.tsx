'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react'

interface ExportItem {
  id: string
  runId: string
  type: string
  fileName: string
  filePath: string | null
  fileSize: number | null
  customer: string
  customerId: string
  model: string
  status: string
  createdAt: string
  publishedAt: string | null
}

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchExports()
  }, [])

  const fetchExports = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/exports')
      const data = await response.json()

      if (data.success) {
        setExports(data.exports)
      }
    } catch (error) {
      console.error('Error fetching exports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (exportId: string, fileName: string) => {
    try {
      setDownloadingId(exportId)
      const response = await fetch(`/api/exports/${exportId}/download`)

      if (!response.ok) {
        throw new Error('Failed to download export')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading export:', error)
      alert('Failed to download export. Please try again.')
    } finally {
      setDownloadingId(null)
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exports</h1>
            <p className="text-muted-foreground">
              Manage SAP uploads and Excel exports
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exports</h1>
          <p className="text-muted-foreground">
            Manage SAP uploads and Excel exports
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SAP Exports</CardTitle>
            <CardDescription>Ready for SAP upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {exports.filter(e => e.type === 'SAP').length}
            </div>
            <p className="text-sm text-muted-foreground">
              {exports.filter(e => e.type === 'SAP' && e.status === 'PUBLISHED').length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Excel Exports</CardTitle>
            <CardDescription>Customer communication files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {exports.filter(e => e.type === 'EXCEL').length}
            </div>
            <p className="text-sm text-muted-foreground">
              Available for download
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>All generated exports and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {exports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No exports found</p>
          ) : (
            <div className="space-y-4">
              {exports.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{exp.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.runId} • {exp.customer} • {exp.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {formatDate(exp.createdAt)}
                        {exp.publishedAt && ` • Published: ${formatDate(exp.publishedAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {exp.status === 'PUBLISHED' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        exp.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {exp.status}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(exp.id, exp.fileName)}
                      disabled={downloadingId === exp.id}
                    >
                      {downloadingId === exp.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
