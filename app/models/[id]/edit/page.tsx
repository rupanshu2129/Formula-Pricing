'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

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
  createdBy: {
    name: string
    email: string
  }
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

export default function EditModelPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [model, setModel] = useState<ModelDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    businessUnit: '',
    category: '',
    bucket: '',
    outputType: '',
    currency: '',
    effectiveStart: '',
    effectiveEnd: '',
  })

  useEffect(() => {
    fetchModel()
  }, [params.id])

  const fetchModel = async () => {
    try {
      const response = await fetch(`/api/pricing-models/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setModel(data.model)
        setFormData({
          name: data.model.name,
          businessUnit: data.model.businessUnit,
          category: data.model.category,
          bucket: data.model.bucket || '',
          outputType: data.model.outputType,
          currency: data.model.currency,
          effectiveStart: data.model.effectiveStart.split('T')[0],
          effectiveEnd: data.model.effectiveEnd ? data.model.effectiveEnd.split('T')[0] : '',
        })
      }
    } catch (error) {
      console.error('Error fetching model:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch(`/api/pricing-models/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      if (data.success) {
        router.push(`/models/${params.id}`)
      }
    } catch (error) {
      console.error('Error updating model:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
        <Button variant="ghost" onClick={() => router.push(`/models/${model.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Model
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Pricing Model</CardTitle>
          <CardDescription>
            Update the details of {model.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessUnit">Business Unit</Label>
                <Input
                  id="businessUnit"
                  name="businessUnit"
                  value={formData.businessUnit}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bucket">Bucket (Optional)</Label>
                <Input
                  id="bucket"
                  name="bucket"
                  value={formData.bucket}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outputType">Output Type</Label>
                <select
                  id="outputType"
                  name="outputType"
                  value={formData.outputType}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="FOB">FOB</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="BOTH">BOTH</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveStart">Effective Start Date</Label>
                <Input
                  id="effectiveStart"
                  name="effectiveStart"
                  type="date"
                  value={formData.effectiveStart}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveEnd">Effective End Date (Optional)</Label>
                <Input
                  id="effectiveEnd"
                  name="effectiveEnd"
                  type="date"
                  value={formData.effectiveEnd}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/models/${model.id}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formula Components</CardTitle>
          <CardDescription>
            Component editing will be available in a future update
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {model.components.length} component(s) defined
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
