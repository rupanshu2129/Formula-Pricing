'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'

interface IngredientComponent {
  name: string
  recipePercent: number
  marketPrice: number
}

interface AdditionalFactors {
  yield: number
  packaging: number
  freight: number
  conversion: number
  rebates: number
  paymentTermsRate: number
}

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
  const [ingredients, setIngredients] = useState<IngredientComponent[]>([
    { name: '', recipePercent: 0, marketPrice: 0 }
  ])
  const [additionalFactors, setAdditionalFactors] = useState<AdditionalFactors>({
    yield: 0,
    packaging: 0,
    freight: 0,
    conversion: 0,
    rebates: 0,
    paymentTermsRate: 0,
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
          ingredients,
          additionalFactors,
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

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', recipePercent: 0, marketPrice: 0 }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) {
      alert('At least one ingredient is required')
      return
    }
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof IngredientComponent, value: any) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setIngredients(newIngredients)
  }

  const updateAdditionalFactor = (field: keyof AdditionalFactors, value: number) => {
    setAdditionalFactors({ ...additionalFactors, [field]: value })
  }

  const totalRecipePercent = ingredients.reduce((sum, ing) => sum + ing.recipePercent, 0)

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
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>
                Recipe percentages and market prices
                {totalRecipePercent > 0 && (
                  <span className={`ml-2 font-medium ${
                    totalRecipePercent > 100 ? 'text-red-500' :
                    Math.abs(totalRecipePercent - 100) < 0.01 ? 'text-green-600' :
                    'text-yellow-600'
                  }`}>
                    (Total: {totalRecipePercent.toFixed(2)}%)
                  </span>
                )}
              </CardDescription>
            </div>
            <Button onClick={addIngredient} size="sm" variant="outline" type="button">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_100px_100px_40px] gap-2 text-xs font-medium text-muted-foreground">
              <div>Name</div>
              <div>Recipe %</div>
              <div>Price ($/lb)</div>
              <div></div>
            </div>
            {ingredients.map((ing, index) => (
              <div key={index} className="grid grid-cols-[1fr_100px_100px_40px] gap-2">
                <Input
                  value={ing.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="Ingredient name"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={ing.recipePercent}
                  onChange={(e) => updateIngredient(index, 'recipePercent', parseFloat(e.target.value) || 0)}
                  placeholder="%"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={ing.marketPrice}
                  onChange={(e) => updateIngredient(index, 'marketPrice', parseFloat(e.target.value) || 0)}
                  placeholder="$/lb"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length <= 1}
                  className="h-10 w-10 p-0"
                  type="button"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Factors</CardTitle>
          <CardDescription>Yield, packaging, freight, and other adders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="yield">Yield (%)</Label>
              <Input
                id="yield"
                type="number"
                step="0.01"
                value={additionalFactors.yield}
                onChange={(e) => updateAdditionalFactor('yield', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="packaging">Packaging ($/lb)</Label>
              <Input
                id="packaging"
                type="number"
                step="0.01"
                value={additionalFactors.packaging}
                onChange={(e) => updateAdditionalFactor('packaging', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="freight">Freight ($/lb)</Label>
              <Input
                id="freight"
                type="number"
                step="0.01"
                value={additionalFactors.freight}
                onChange={(e) => updateAdditionalFactor('freight', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="conversion">Conversion ($/lb)</Label>
              <Input
                id="conversion"
                type="number"
                step="0.01"
                value={additionalFactors.conversion}
                onChange={(e) => updateAdditionalFactor('conversion', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="rebates">Rebates ($/lb)</Label>
              <Input
                id="rebates"
                type="number"
                step="0.01"
                value={additionalFactors.rebates}
                onChange={(e) => updateAdditionalFactor('rebates', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="paymentTermsRate">Payment Terms Rate (%)</Label>
              <Input
                id="paymentTermsRate"
                type="number"
                step="0.01"
                value={additionalFactors.paymentTermsRate}
                onChange={(e) => updateAdditionalFactor('paymentTermsRate', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/models')}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
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
    </div>
  )
}
