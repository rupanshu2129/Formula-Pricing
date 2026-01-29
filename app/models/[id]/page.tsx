'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react'

interface ModelDetail {
  id: string
  name: string
  version: number
  businessUnit: string
  category: string
  bucket: string | null
  outputType: string
  currency: string
  governanceState: string
  effectiveStart: string
  effectiveEnd: string | null
  createdAt: string
  updatedAt: string
  createdBy: {
    name: string
    email: string
  }
  segment: {
    name: string
    description: string
  } | null
  components: Array<{
    id: string
    type: string
    name: string
    formula: string
    isEditable: boolean
    owner: string | null
    updateFrequency: string | null
    sortOrder: number
  }>
}

export default function ViewModelPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [model, setModel] = useState<ModelDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchModel()
  }, [params.id])

  const fetchModel = async () => {
    try {
      const response = await fetch(`/api/pricing-models/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setModel(data.model)
      }
    } catch (error) {
      console.error('Error fetching model:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'DRAFT':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'EXPIRED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getComponentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      INGREDIENT: 'bg-purple-100 text-purple-800',
      YIELD: 'bg-blue-100 text-blue-800',
      PACKAGING: 'bg-green-100 text-green-800',
      FREIGHT: 'bg-orange-100 text-orange-800',
      CONVERSION: 'bg-pink-100 text-pink-800',
      REBATE: 'bg-red-100 text-red-800',
      TERMS_RATE: 'bg-indigo-100 text-indigo-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!model) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/models')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Models
        </Button>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Model not found
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/models')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Models
        </Button>
        <Button onClick={() => router.push(`/models/${model.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Model
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <CardTitle className="text-3xl">{model.name}</CardTitle>
                <span className="text-lg text-muted-foreground">v{model.version}</span>
                {getStatusIcon(model.governanceState)}
              </div>
              <CardDescription className="text-base">
                {model.businessUnit} • {model.category}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(model.governanceState)}>
              {model.governanceState}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Output Type</p>
              <p className="font-medium">{model.outputType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Currency</p>
              <p className="font-medium">{model.currency}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Effective Start</p>
              <p className="font-medium">{formatDate(model.effectiveStart)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Effective End</p>
              <p className="font-medium">{model.effectiveEnd ? formatDate(model.effectiveEnd) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created By</p>
              <p className="font-medium">{model.createdBy.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created At</p>
              <p className="font-medium">{formatDate(model.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
              <p className="font-medium">{formatDate(model.updatedAt)}</p>
            </div>
            {model.segment && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Segment</p>
                <p className="font-medium">{model.segment.name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formula Components</CardTitle>
          <CardDescription>
            Components that make up this pricing model
          </CardDescription>
        </CardHeader>
        <CardContent>
          {model.components.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No components defined for this model
            </div>
          ) : (
            <div className="space-y-4">
              {model.components.map((component) => (
                <Card key={component.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{component.name}</h4>
                          <Badge className={getComponentTypeColor(component.type)}>
                            {component.type}
                          </Badge>
                          {component.isEditable && (
                            <Badge variant="outline" className="text-xs">
                              Editable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Formula: <code className="bg-muted px-2 py-1 rounded">{component.formula}</code>
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {component.owner && (
                        <div>
                          <p className="text-muted-foreground">Owner</p>
                          <p className="font-medium">{component.owner}</p>
                        </div>
                      )}
                      {component.updateFrequency && (
                        <div>
                          <p className="text-muted-foreground">Update Frequency</p>
                          <p className="font-medium">{component.updateFrequency}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Sort Order</p>
                        <p className="font-medium">{component.sortOrder}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
