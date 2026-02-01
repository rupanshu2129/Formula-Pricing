'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react'

interface IngredientComponent {
  id?: string
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
    parameters?: any
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

        const ingredientComponents = data.model.components.filter((c: any) => c.type === 'INGREDIENT')
        if (ingredientComponents.length > 0) {
          setIngredients(ingredientComponents.map((c: any) => ({
            id: c.id,
            name: c.name,
            recipePercent: c.parameters?.recipePercent || 0,
            marketPrice: c.parameters?.marketPrice || 0,
          })))
        }

        const yieldComp = data.model.components.find((c: any) => c.type === 'YIELD')
        const packagingComp = data.model.components.find((c: any) => c.type === 'PACKAGING')
        const freightComp = data.model.components.find((c: any) => c.type === 'FREIGHT')
        const conversionComp = data.model.components.find((c: any) => c.type === 'CONVERSION')
        const rebateComp = data.model.components.find((c: any) => c.type === 'REBATE')
        const termsRateComp = data.model.components.find((c: any) => c.type === 'TERMS_RATE')

        setAdditionalFactors({
          yield: yieldComp?.parameters?.value || 0,
          packaging: packagingComp?.parameters?.value || 0,
          freight: freightComp?.parameters?.value || 0,
          conversion: conversionComp?.parameters?.value || 0,
          rebates: rebateComp?.parameters?.value || 0,
          paymentTermsRate: termsRateComp?.parameters?.value || 0,
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
        body: JSON.stringify({
          ...formData,
          ingredients,
          additionalFactors,
        }),
      })

      const data = await response.json()
      if (data.success) {
        router.push(`/models/${params.id}`)
      } else {
        alert(data.error || 'Failed to update model')
      }
    } catch (error) {
      console.error('Error updating model:', error)
      alert('Failed to update model')
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
          onClick={() => router.push(`/models/${model.id}`)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
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
    </div>
  )
}
