export enum UserRole {
  STRATEGIC_PRICING = 'STRATEGIC_PRICING',
  PRICE_EXECUTION = 'PRICE_EXECUTION',
  SALES = 'SALES',
  ADMIN = 'ADMIN',
  AUDIT = 'AUDIT',
}

export enum GovernanceState {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export enum ComponentType {
  INGREDIENT = 'INGREDIENT',
  YIELD = 'YIELD',
  PACKAGING = 'PACKAGING',
  FREIGHT = 'FREIGHT',
  CONVERSION = 'CONVERSION',
  REBATE = 'REBATE',
  PAYMENT_TERMS = 'PAYMENT_TERMS',
}

export enum OutputType {
  PRE_YIELD = 'PRE_YIELD',
  POST_YIELD = 'POST_YIELD',
  FOB = 'FOB',
  TOTAL_FOB = 'TOTAL_FOB',
}

export enum RunStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
}

export enum RefreshFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export interface IngredientInput {
  name: string
  recipePercent: number
  marketPrice: number
  marketReference?: string
}

export interface PricingCalculationInput {
  ingredients: IngredientInput[]
  yieldPercent: number
  packaging?: number
  freight?: number
  conversion?: number
  rebates?: number
  paymentTermsRate: number
  paymentTerms?: string
  plant?: string
}

export interface ComponentBreakdown {
  component: string
  factorType: string
  factorValue: number | null
  marketReference: string
  calculatedCost: number | null
}

export interface PricingCalculationOutput {
  preYieldSubtotal: number
  postYieldSubtotal: number
  fobPreTerms: number
  fobFinal: number
  paymentTermsAdder: number
  breakdown: ComponentBreakdown[]
  validation: {
    recipePercentTotal: number
    recipePercentValid: boolean
    allMarketPricesPresent: boolean
    yieldValid: boolean
  }
}

export interface ExportFormat {
  type: 'SAP' | 'EXCEL'
  filename: string
  generatedAt: Date
}

export interface ImportValidationError {
  row: number
  column: string
  value: any
  error: string
}

export interface RefreshAlert {
  id: string
  type: 'MODEL' | 'MARKET_DATA' | 'CUSTOMER_CONFIG'
  name: string
  dueDate: Date
  status: 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING'
  daysUntilDue: number
}
