'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Play, Eye, Download, Save, CheckCircle, AlertCircle, Trash2, X } from 'lucide-react'
import { PricingEngine } from '@/lib/pricing-engine'
import { IngredientInput, PricingCalculationOutput } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'

interface FormErrors {
  customer?: string
  model?: string
  periodStart?: string
  periodEnd?: string
  ingredients?: { [key: number]: { name?: string; recipePercent?: string; marketPrice?: string; marketReference?: string } }
  yield?: string
  packaging?: string
  freight?: string
  conversion?: string
  rebates?: string
  paymentTermsRate?: string
  general?: string
}

export default function PricingRunsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create')
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [savedRunNumber, setSavedRunNumber] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showValidation, setShowValidation] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])

  const [formData, setFormData] = useState({
    customer: '',
    model: '',
    periodStart: '',
    periodEnd: '',
    plant: '',
    paymentTerms: 'NET30',
    ingredients: [
      { name: 'Beef Index A', recipePercent: 44.25, marketPrice: 2.72 },
      { name: 'Beef Index B', recipePercent: 44.55, marketPrice: 3.01 },
      { name: 'Other Ingredients', recipePercent: 4.2, marketPrice: 0.90 },
    ] as IngredientInput[],
    yield: 63,
    packaging: 0.14,
    freight: 0.09,
    conversion: 0,
    rebates: 0,
    paymentTermsRate: 2.52,
  })

  const [calculatedPrice, setCalculatedPrice] = useState<PricingCalculationOutput | null>(null)
  const [runHistory, setRunHistory] = useState<any[]>([])
  const [selectedRun, setSelectedRun] = useState<any | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  useEffect(() => {
    fetchRunHistory()
    fetchCustomersAndModels()
  }, [])

  const fetchRunHistory = async () => {
    try {
      const response = await fetch('/api/pricing-runs')
      const data = await response.json()
      if (data.success) {
        setRunHistory(data.runs || [])
      }
    } catch (error) {
      console.error('Error fetching run history:', error)
    }
  }

  const fetchCustomersAndModels = async () => {
    try {
      const [customersRes, modelsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/pricing-models')
      ])

      const customersData = await customersRes.json()
      const modelsData = await modelsRes.json()

      if (customersData.success) {
        setCustomers(customersData.customers || [])
      }
      if (modelsData.success) {
        setModels(modelsData.models || [])
      }
    } catch (error) {
      console.error('Error fetching customers and models:', error)
    }
  }

  const handleViewDetails = async (runId: string) => {
    try {
      const response = await fetch(`/api/pricing-runs/${runId}`)
      const data = await response.json()
      if (data.success) {
        setSelectedRun(data.run)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Error fetching run details:', error)
    }
  }

  const handleExportRun = async (runId: string) => {
    try {
      const response = await fetch(`/api/pricing-runs/${runId}/export`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pricing-run-${selectedRun?.runNumber || 'export'}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        console.error('Failed to export pricing run')
      }
    } catch (error) {
      console.error('Error exporting pricing run:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.customer || formData.customer.trim() === '') {
      newErrors.customer = 'Customer is required'
    }

    if (!formData.model || formData.model.trim() === '') {
      newErrors.model = 'Pricing model is required'
    }

    if (!formData.periodStart) {
      newErrors.periodStart = 'Period start date is required'
    }

    if (!formData.periodEnd) {
      newErrors.periodEnd = 'Period end date is required'
    }

    if (formData.periodStart && formData.periodEnd && new Date(formData.periodStart) > new Date(formData.periodEnd)) {
      newErrors.periodEnd = 'End date must be after start date'
    }

    if (formData.ingredients.length === 0) {
      newErrors.general = 'At least one ingredient is required'
    }

    const ingredientErrors: { [key: number]: any } = {}
    formData.ingredients.forEach((ing, index) => {
      const ingErrors: any = {}

      if (!ing.name || ing.name.trim() === '') {
        ingErrors.name = 'Name required'
      }

      if (ing.recipePercent < 0 || ing.recipePercent > 100) {
        ingErrors.recipePercent = 'Must be 0-100'
      }

      if (ing.marketPrice < 0) {
        ingErrors.marketPrice = 'Cannot be negative'
      }

      if (Object.keys(ingErrors).length > 0) {
        ingredientErrors[index] = ingErrors
      }
    })

    if (Object.keys(ingredientErrors).length > 0) {
      newErrors.ingredients = ingredientErrors
    }

    const totalRecipePercent = formData.ingredients.reduce((sum, ing) => sum + ing.recipePercent, 0)
    if (totalRecipePercent > 100) {
      newErrors.general = `Total recipe percentage (${totalRecipePercent.toFixed(2)}%) exceeds 100%`
    }

    if (formData.yield <= 0 || formData.yield > 100) {
      newErrors.yield = 'Yield must be between 0 and 100'
    }

    if (formData.packaging < 0) {
      newErrors.packaging = 'Cannot be negative'
    }

    if (formData.freight < 0) {
      newErrors.freight = 'Cannot be negative'
    }

    if (formData.conversion < 0) {
      newErrors.conversion = 'Cannot be negative'
    }

    if (formData.rebates < 0) {
      newErrors.rebates = 'Cannot be negative'
    }

    if (formData.paymentTermsRate < 0) {
      newErrors.paymentTermsRate = 'Cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const calculatePrice = () => {
    setShowValidation(true)

    if (!validateForm()) {
      return
    }

    setIsCalculating(true)

    try {
      const engine = new PricingEngine()
      const result = engine.calculatePrice({
        ingredients: formData.ingredients,
        yieldPercent: formData.yield,
        packaging: formData.packaging,
        freight: formData.freight,
        conversion: formData.conversion,
        rebates: formData.rebates,
        paymentTermsRate: formData.paymentTermsRate,
        paymentTerms: formData.paymentTerms,
        plant: formData.plant
      })

      setCalculatedPrice(result)
      setSaveSuccess(false)
      setSavedRunNumber(null)
      setErrors({})
    } catch (error: any) {
      setErrors({ general: error.message || 'Calculation failed' })
      setCalculatedPrice(null)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSaveRun = async () => {
    if (!calculatedPrice) {
      setErrors({ general: 'Please calculate the price first' })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch('/api/pricing-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          calculatedPrice
        })
      })

      const data = await response.json()

      if (data.success) {
        setSaveSuccess(true)
        setSavedRunNumber(data.runNumber)
        await fetchRunHistory()
        setTimeout(() => setSaveSuccess(false), 5000)
      } else {
        setErrors({ general: data.error || 'Failed to save pricing run' })
      }
    } catch (error: any) {
      console.error('Error saving run:', error)
      setErrors({ general: 'Error saving pricing run. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportToExcel = async () => {
    if (!calculatedPrice) {
      setErrors({ general: 'Please calculate the price first' })
      return
    }

    setIsExporting(true)

    try {
      const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          calculatedPrice,
          runNumber: savedRunNumber || 'DRAFT'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pricing-run-${savedRunNumber || 'draft'}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setErrors({ general: 'Failed to export to Excel' })
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      setErrors({ general: 'Error exporting to Excel. Please try again.' })
    } finally {
      setIsExporting(false)
    }
  }

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', recipePercent: 0, marketPrice: 0 }]
    })
  }

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length <= 1) {
      setErrors({ general: 'At least one ingredient is required' })
      return
    }

    const newIngredients = formData.ingredients.filter((_, i) => i !== index)
    setFormData({ ...formData, ingredients: newIngredients })

    if (errors.ingredients) {
      const newIngredientErrors = { ...errors.ingredients }
      delete newIngredientErrors[index]
      setErrors({ ...errors, ingredients: newIngredientErrors })
    }
  }

  const updateIngredient = (index: number, field: keyof IngredientInput, value: any) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setFormData({ ...formData, ingredients: newIngredients })

    if (showValidation && errors.ingredients?.[index]?.[field]) {
      const newErrors = { ...errors }
      if (newErrors.ingredients) {
        delete newErrors.ingredients[index][field]
        if (Object.keys(newErrors.ingredients[index]).length === 0) {
          delete newErrors.ingredients[index]
        }
      }
      setErrors(newErrors)
    }
  }

  const totalRecipePercent = formData.ingredients.reduce((sum, ing) => sum + ing.recipePercent, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price Execution</h1>
          <p className="text-muted-foreground">
            Run pricing calculations and manage execution history
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'create'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
        >
          Create New Run
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground'
          }`}
        >
          Run History
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            {errors.general && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{errors.general}</p>
                </div>
                <button onClick={() => setErrors({ ...errors, general: undefined })} className="ml-auto">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Run Configuration</CardTitle>
                <CardDescription>Select customer, model, and pricing period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`flex h-10 w-full rounded-md border ${
                      errors.customer ? 'border-red-500' : 'border-input'
                    } bg-background px-3 py-2 text-sm mt-1`}
                    value={formData.customer}
                    onChange={(e) => {
                      setFormData({ ...formData, customer: e.target.value })
                      if (errors.customer) setErrors({ ...errors, customer: undefined })
                    }}
                  >
                    <option value="">Select customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} ({customer.soldToId})
                      </option>
                    ))}
                  </select>
                  {errors.customer && <p className="text-xs text-red-500 mt-1">{errors.customer}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Pricing Model <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`flex h-10 w-full rounded-md border ${
                      errors.model ? 'border-red-500' : 'border-input'
                    } bg-background px-3 py-2 text-sm mt-1`}
                    value={formData.model}
                    onChange={(e) => {
                      setFormData({ ...formData, model: e.target.value })
                      if (errors.model) setErrors({ ...errors, model: undefined })
                    }}
                  >
                    <option value="">Select model...</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} v{model.version} - {model.businessUnit}
                      </option>
                    ))}
                  </select>
                  {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Period Start <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      className={`mt-1 ${errors.periodStart ? 'border-red-500' : ''}`}
                      value={formData.periodStart}
                      onChange={(e) => {
                        setFormData({ ...formData, periodStart: e.target.value })
                        if (errors.periodStart) setErrors({ ...errors, periodStart: undefined })
                      }}
                    />
                    {errors.periodStart && <p className="text-xs text-red-500 mt-1">{errors.periodStart}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Period End <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      className={`mt-1 ${errors.periodEnd ? 'border-red-500' : ''}`}
                      value={formData.periodEnd}
                      onChange={(e) => {
                        setFormData({ ...formData, periodEnd: e.target.value })
                        if (errors.periodEnd) setErrors({ ...errors, periodEnd: undefined })
                      }}
                    />
                    {errors.periodEnd && <p className="text-xs text-red-500 mt-1">{errors.periodEnd}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Plant (optional)</label>
                    <Input
                      type="text"
                      className="mt-1"
                      placeholder="e.g., Plant A"
                      value={formData.plant}
                      onChange={(e) => setFormData({ ...formData, plant: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Terms</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    >
                      <option value="NET30">NET30</option>
                      <option value="NET60">NET60</option>
                      <option value="NET90">NET90</option>
                    </select>
                  </div>
                </div>
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
                  <Button onClick={addIngredient} size="sm" variant="outline">
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
                  {formData.ingredients.map((ing, index) => (
                    <div key={index} className="space-y-1">
                      <div className="grid grid-cols-[1fr_100px_100px_40px] gap-2">
                        <Input
                          value={ing.name}
                          onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                          placeholder="Ingredient name"
                          className={errors.ingredients?.[index]?.name ? 'border-red-500' : ''}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={ing.recipePercent}
                          onChange={(e) => updateIngredient(index, 'recipePercent', parseFloat(e.target.value) || 0)}
                          placeholder="%"
                          className={errors.ingredients?.[index]?.recipePercent ? 'border-red-500' : ''}
                        />
                        <Input
                          type="number"
                          step="0.01"
                          value={ing.marketPrice}
                          onChange={(e) => updateIngredient(index, 'marketPrice', parseFloat(e.target.value) || 0)}
                          placeholder="$/lb"
                          className={errors.ingredients?.[index]?.marketPrice ? 'border-red-500' : ''}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          disabled={formData.ingredients.length <= 1}
                          className="h-10 w-10 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      {errors.ingredients?.[index] && (
                        <div className="text-xs text-red-500 pl-1">
                          {Object.values(errors.ingredients[index]).join(', ')}
                        </div>
                      )}
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
                    <label className="text-sm font-medium">Yield (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.yield}
                      onChange={(e) => {
                        setFormData({ ...formData, yield: parseFloat(e.target.value) || 0 })
                        if (errors.yield) setErrors({ ...errors, yield: undefined })
                      }}
                      className={`mt-1 ${errors.yield ? 'border-red-500' : ''}`}
                    />
                    {errors.yield && <p className="text-xs text-red-500 mt-1">{errors.yield}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Packaging ($/lb)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.packaging}
                      onChange={(e) => {
                        setFormData({ ...formData, packaging: parseFloat(e.target.value) || 0 })
                        if (errors.packaging) setErrors({ ...errors, packaging: undefined })
                      }}
                      className={`mt-1 ${errors.packaging ? 'border-red-500' : ''}`}
                    />
                    {errors.packaging && <p className="text-xs text-red-500 mt-1">{errors.packaging}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Freight ($/lb)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.freight}
                      onChange={(e) => {
                        setFormData({ ...formData, freight: parseFloat(e.target.value) || 0 })
                        if (errors.freight) setErrors({ ...errors, freight: undefined })
                      }}
                      className={`mt-1 ${errors.freight ? 'border-red-500' : ''}`}
                    />
                    {errors.freight && <p className="text-xs text-red-500 mt-1">{errors.freight}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Conversion ($/lb)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.conversion}
                      onChange={(e) => {
                        setFormData({ ...formData, conversion: parseFloat(e.target.value) || 0 })
                        if (errors.conversion) setErrors({ ...errors, conversion: undefined })
                      }}
                      className={`mt-1 ${errors.conversion ? 'border-red-500' : ''}`}
                    />
                    {errors.conversion && <p className="text-xs text-red-500 mt-1">{errors.conversion}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rebates ($/lb)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.rebates}
                      onChange={(e) => {
                        setFormData({ ...formData, rebates: parseFloat(e.target.value) || 0 })
                        if (errors.rebates) setErrors({ ...errors, rebates: undefined })
                      }}
                      className={`mt-1 ${errors.rebates ? 'border-red-500' : ''}`}
                    />
                    {errors.rebates && <p className="text-xs text-red-500 mt-1">{errors.rebates}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Payment Terms Rate (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.paymentTermsRate}
                      onChange={(e) => {
                        setFormData({ ...formData, paymentTermsRate: parseFloat(e.target.value) || 0 })
                        if (errors.paymentTermsRate) setErrors({ ...errors, paymentTermsRate: undefined })
                      }}
                      className={`mt-1 ${errors.paymentTermsRate ? 'border-red-500' : ''}`}
                    />
                    {errors.paymentTermsRate && <p className="text-xs text-red-500 mt-1">{errors.paymentTermsRate}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={calculatePrice}
              className="w-full"
              size="lg"
              disabled={isCalculating}
            >
              <Play className="mr-2 h-4 w-4" />
              {isCalculating ? 'Calculating...' : 'Calculate Price'}
            </Button>
          </div>

          <div className="space-y-6">
            {calculatedPrice && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Calculation Results</CardTitle>
                    <CardDescription>Price breakdown and outputs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {calculatedPrice.breakdown.map((item, index) => (
                        <div
                          key={index}
                          className={`flex justify-between py-2 ${
                            item.component.includes('subtotal') || item.component.includes('FOB')
                              ? 'border-t font-medium'
                              : ''
                          } ${
                            item.component === 'FOB Price (final)'
                              ? 'bg-primary/10 px-2 rounded mt-2'
                              : ''
                          }`}
                        >
                          <span className={`text-sm ${
                            item.component === 'FOB Price (final)' ? 'font-bold' : ''
                          }`}>
                            {item.component}
                          </span>
                          <span className={`${
                            item.component === 'FOB Price (final)'
                              ? 'font-bold text-lg text-primary'
                              : 'font-medium'
                          }`}>
                            {item.calculatedCost !== null ? `$${item.calculatedCost.toFixed(4)}` : '-'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {!calculatedPrice.validation.recipePercentValid && (
                      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Warning</p>
                          <p>Recipe percentage total is {calculatedPrice.validation.recipePercentTotal.toFixed(2)}%. Consider adjusting to 100%.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                    <CardDescription>Save and export this pricing run</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {saveSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-md mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Saved as {savedRunNumber}</span>
                      </div>
                    )}
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleSaveRun}
                      disabled={isSaving}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? 'Saving...' : 'Save Run'}
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleExportToExcel}
                      disabled={isExporting}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {isExporting ? 'Exporting...' : 'Export to Excel'}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Pricing Run History</CardTitle>
            <CardDescription>View and manage past pricing executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {runHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pricing runs yet. Create your first run!</p>
              ) : (
                runHistory.map((run) => (
                  <div key={run.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{run.runNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {run.customer?.name || 'N/A'} • {run.modelTemplate?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm">{new Date(run.createdAt).toLocaleDateString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          run.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          run.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {run.status}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(run.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogClose onClose={() => setShowDetailsDialog(false)} />
          <DialogHeader>
            <DialogTitle>Pricing Run Details</DialogTitle>
            <DialogDescription>
              Complete information about this pricing run
            </DialogDescription>
          </DialogHeader>

          {selectedRun && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Run Number</h3>
                  <p className="text-lg font-medium">{selectedRun.runNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Status</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    selectedRun.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    selectedRun.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    selectedRun.status === 'CALCULATING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRun.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Customer</h3>
                  <p className="text-lg">{selectedRun.customer?.name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Pricing Model</h3>
                  <p className="text-lg">{selectedRun.modelTemplate?.name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Pricing Period</h3>
                  <p className="text-lg">
                    {new Date(selectedRun.pricingPeriodStart).toLocaleDateString()} - {new Date(selectedRun.pricingPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Created</h3>
                  <p className="text-lg">{new Date(selectedRun.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {selectedRun.inputSnapshot && Object.keys(selectedRun.inputSnapshot).length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Input Parameters</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      {selectedRun.inputSnapshot.yield !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Yield:</span>
                          <span className="ml-2 font-medium">{selectedRun.inputSnapshot.yield}%</span>
                        </div>
                      )}
                      {selectedRun.inputSnapshot.packaging !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Packaging:</span>
                          <span className="ml-2 font-medium">${selectedRun.inputSnapshot.packaging}</span>
                        </div>
                      )}
                      {selectedRun.inputSnapshot.freight !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Freight:</span>
                          <span className="ml-2 font-medium">${selectedRun.inputSnapshot.freight}</span>
                        </div>
                      )}
                      {selectedRun.inputSnapshot.conversion !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Conversion:</span>
                          <span className="ml-2 font-medium">${selectedRun.inputSnapshot.conversion}</span>
                        </div>
                      )}
                      {selectedRun.inputSnapshot.rebates !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Rebates:</span>
                          <span className="ml-2 font-medium">${selectedRun.inputSnapshot.rebates}</span>
                        </div>
                      )}
                      {selectedRun.inputSnapshot.paymentTermsRate !== undefined && (
                        <div>
                          <span className="text-sm text-muted-foreground">Payment Terms Rate:</span>
                          <span className="ml-2 font-medium">{selectedRun.inputSnapshot.paymentTermsRate}%</span>
                        </div>
                      )}
                    </div>

                    {selectedRun.inputSnapshot.ingredients && selectedRun.inputSnapshot.ingredients.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">Ingredients</h4>
                        <div className="space-y-2">
                          {selectedRun.inputSnapshot.ingredients.map((ing: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-2 rounded">
                              <span className="font-medium">{ing.name}</span>
                              <div className="text-sm text-muted-foreground">
                                <span className="mr-4">Recipe: {ing.recipePercent}%</span>
                                <span>Price: ${ing.marketPrice}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedRun.products && selectedRun.products.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Products ({selectedRun.products.length})</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold">Product</th>
                          <th className="px-4 py-2 text-right text-sm font-semibold">FOB Price</th>
                          <th className="px-4 py-2 text-right text-sm font-semibold">Total FOB</th>
                          <th className="px-4 py-2 text-right text-sm font-semibold">Delivered Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRun.products.map((product: any) => (
                          <tr key={product.id} className="border-t">
                            <td className="px-4 py-2">{product.product?.name || 'N/A'}</td>
                            <td className="px-4 py-2 text-right">${product.fobPrice?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-2 text-right">${product.totalFOB?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-2 text-right">${product.deliveredPrice?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
                <Button onClick={() => selectedRun && handleExportRun(selectedRun.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Results
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
