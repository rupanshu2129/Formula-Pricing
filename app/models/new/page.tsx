'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

export default function NewModelPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    version: '1',
    businessUnit: '',
    category: '',
    bucket: '',
    outputType: 'FOB',
    currency: 'USD',
    effectiveStart: new Date().toISOString().split('T')[0],
    effectiveEnd: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch('/api/pricing-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          version: parseInt(formData.version),
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        router.push(`/models/${data.model.id}`)
      } else {
        alert(data.error || 'Failed to create model')
      }
    } catch (error) {
      console.error('Error creating model:', error)
      alert('Failed to create model')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/models')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Models
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Pricing Model</CardTitle>
          <CardDescription>
            Define a new pricing formula template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Model Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Premium Protein Pricing"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  name="version"
                  type="number"
                  min="1"
                  value={formData.version}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessUnit">Business Unit *</Label>
                <Input
                  id="businessUnit"
                  name="businessUnit"
                  value={formData.businessUnit}
                  onChange={handleChange}
                  placeholder="e.g., Protein, Grain, Specialty"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Standard, Premium, Export"
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
                  placeholder="Optional grouping"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outputType">Output Type *</Label>
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
                <Label htmlFor="currency">Currency *</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveStart">Effective Start Date *</Label>
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
                onClick={() => router.push('/models')}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Model
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            After creating the model, you can add formula components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Once the model is created, you&apos;ll be able to add components like ingredients,
            yield adjustments, packaging costs, freight, conversion costs, rebates, and payment terms.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
