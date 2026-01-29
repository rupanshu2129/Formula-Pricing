import { PricingCalculationInput, PricingCalculationOutput, ComponentBreakdown } from '@/types'

export class PricingEngine {
  calculatePrice(input: PricingCalculationInput): PricingCalculationOutput {
    this.validateInputs(input)

    const breakdown: ComponentBreakdown[] = []

    let preYieldSubtotal = 0
    input.ingredients.forEach((ing) => {
      const ingredientCost = (ing.recipePercent / 100) * ing.marketPrice
      preYieldSubtotal += ingredientCost

      breakdown.push({
        component: ing.name,
        factorType: 'Recipe %',
        factorValue: ing.recipePercent / 100,
        marketReference: ing.marketReference || '-',
        calculatedCost: ingredientCost
      })
    })

    breakdown.push({
      component: 'Pre-yield subtotal',
      factorType: 'CALC',
      factorValue: null,
      marketReference: '-',
      calculatedCost: preYieldSubtotal
    })

    const yieldDivisor = input.yieldPercent / 100
    breakdown.push({
      component: 'Yield',
      factorType: 'Yield divisor',
      factorValue: yieldDivisor,
      marketReference: '-',
      calculatedCost: null
    })

    const postYieldSubtotal = preYieldSubtotal / yieldDivisor
    breakdown.push({
      component: 'Post-yield subtotal',
      factorType: 'CALC',
      factorValue: null,
      marketReference: '-',
      calculatedCost: postYieldSubtotal
    })

    let fobPreTerms = postYieldSubtotal

    if (input.packaging) {
      fobPreTerms += input.packaging
      breakdown.push({
        component: 'Packaging',
        factorType: 'Adder',
        factorValue: input.packaging,
        marketReference: '-',
        calculatedCost: input.packaging
      })
    }

    if (input.freight) {
      fobPreTerms += input.freight
      breakdown.push({
        component: 'Freight',
        factorType: 'Adder',
        factorValue: input.freight,
        marketReference: input.plant || '-',
        calculatedCost: input.freight
      })
    }

    if (input.conversion) {
      fobPreTerms += input.conversion
      breakdown.push({
        component: 'Conversion',
        factorType: 'Adder',
        factorValue: input.conversion,
        marketReference: '-',
        calculatedCost: input.conversion
      })
    }

    if (input.rebates) {
      fobPreTerms -= input.rebates
      breakdown.push({
        component: 'Rebates',
        factorType: 'Deduction',
        factorValue: input.rebates,
        marketReference: '-',
        calculatedCost: -input.rebates
      })
    }

    breakdown.push({
      component: 'FOB Price (pre terms)',
      factorType: 'CALC',
      factorValue: null,
      marketReference: '-',
      calculatedCost: fobPreTerms
    })

    const paymentTermsRate = input.paymentTermsRate / 100
    const paymentTermsAdder = fobPreTerms * paymentTermsRate
    breakdown.push({
      component: 'Payment Terms',
      factorType: 'Rate',
      factorValue: paymentTermsRate,
      marketReference: input.paymentTerms || 'NET30',
      calculatedCost: paymentTermsAdder
    })

    const fobFinal = fobPreTerms + paymentTermsAdder
    breakdown.push({
      component: 'FOB Price (final)',
      factorType: 'CALC',
      factorValue: null,
      marketReference: '-',
      calculatedCost: fobFinal
    })

    const recipePercentTotal = input.ingredients.reduce((sum, ing) => sum + ing.recipePercent, 0)

    return {
      preYieldSubtotal,
      postYieldSubtotal,
      fobPreTerms,
      fobFinal,
      paymentTermsAdder,
      breakdown,
      validation: {
        recipePercentTotal,
        recipePercentValid: Math.abs(recipePercentTotal - 100) < 0.01,
        allMarketPricesPresent: input.ingredients.every(ing => ing.marketPrice > 0),
        yieldValid: input.yieldPercent > 0 && input.yieldPercent <= 100
      }
    }
  }

  validateInputs(input: PricingCalculationInput): void {
    if (!input.ingredients || input.ingredients.length === 0) {
      throw new Error('At least one ingredient is required')
    }

    if (!input.yieldPercent || input.yieldPercent <= 0 || input.yieldPercent > 100) {
      throw new Error('Yield must be between 0 and 100')
    }

    input.ingredients.forEach((ing, index) => {
      if (!ing.name || ing.name.trim() === '') {
        throw new Error(`Ingredient ${index + 1}: Name is required`)
      }

      if (ing.recipePercent < 0 || ing.recipePercent > 100) {
        throw new Error(`Ingredient ${ing.name}: Recipe % must be between 0 and 100`)
      }

      if (ing.marketPrice < 0) {
        throw new Error(`Ingredient ${ing.name}: Market price cannot be negative`)
      }
    })

    const totalRecipePercent = input.ingredients.reduce((sum, ing) => sum + ing.recipePercent, 0)
    if (totalRecipePercent > 100) {
      throw new Error(`Total recipe percentage (${totalRecipePercent.toFixed(2)}%) exceeds 100%`)
    }

    if (input.packaging && input.packaging < 0) {
      throw new Error('Packaging cost cannot be negative')
    }

    if (input.freight && input.freight < 0) {
      throw new Error('Freight cost cannot be negative')
    }

    if (input.conversion && input.conversion < 0) {
      throw new Error('Conversion cost cannot be negative')
    }

    if (input.rebates && input.rebates < 0) {
      throw new Error('Rebates cannot be negative')
    }

    if (input.paymentTermsRate < 0) {
      throw new Error('Payment terms rate cannot be negative')
    }
  }
}
