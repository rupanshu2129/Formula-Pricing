import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

interface ValidationError {
  row: number
  column: string
  error: string
  value?: any
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings?: string[]
  recordCount?: number
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    const validationResult = validatePricingData(data)

    if (validationResult.valid) {
      return NextResponse.json({
        success: true,
        validation: validationResult,
        message: 'File validated successfully'
      })
    } else {
      return NextResponse.json({
        success: false,
        validation: validationResult,
        message: 'File validation failed'
      })
    }
  } catch (error) {
    console.error('Error processing file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process file' },
      { status: 500 }
    )
  }
}

function validatePricingData(data: any[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  if (data.length === 0) {
    errors.push({
      row: 0,
      column: 'File',
      error: 'File is empty or has no data'
    })
    return { valid: false, errors, warnings }
  }

  const requiredColumns = ['Product Code', 'Product Name', 'Base Price']
  const firstRow = data[0]
  
  for (const col of requiredColumns) {
    if (!(col in firstRow)) {
      errors.push({
        row: 0,
        column: col,
        error: `Required column "${col}" is missing`
      })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings }
  }

  data.forEach((row, index) => {
    const rowNumber = index + 2

    if (!row['Product Code'] || row['Product Code'].toString().trim() === '') {
      errors.push({
        row: rowNumber,
        column: 'Product Code',
        error: 'Product Code is required'
      })
    }

    if (!row['Product Name'] || row['Product Name'].toString().trim() === '') {
      errors.push({
        row: rowNumber,
        column: 'Product Name',
        error: 'Product Name is required'
      })
    }

    if (!row['Base Price']) {
      errors.push({
        row: rowNumber,
        column: 'Base Price',
        error: 'Base Price is required'
      })
    } else if (isNaN(Number(row['Base Price']))) {
      errors.push({
        row: rowNumber,
        column: 'Base Price',
        error: 'Base Price must be a valid number',
        value: row['Base Price']
      })
    } else if (Number(row['Base Price']) < 0) {
      errors.push({
        row: rowNumber,
        column: 'Base Price',
        error: 'Base Price cannot be negative',
        value: row['Base Price']
      })
    }

    if (row['Minimum Order Quantity'] && isNaN(Number(row['Minimum Order Quantity']))) {
      errors.push({
        row: rowNumber,
        column: 'Minimum Order Quantity',
        error: 'Minimum Order Quantity must be a valid number',
        value: row['Minimum Order Quantity']
      })
    }

    if (row['Effective Date']) {
      const date = new Date(row['Effective Date'])
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowNumber,
          column: 'Effective Date',
          error: 'Invalid date format. Use YYYY-MM-DD',
          value: row['Effective Date']
        })
      }
    }

    if (row['Expiry Date']) {
      const date = new Date(row['Expiry Date'])
      if (isNaN(date.getTime())) {
        errors.push({
          row: rowNumber,
          column: 'Expiry Date',
          error: 'Invalid date format. Use YYYY-MM-DD',
          value: row['Expiry Date']
        })
      }
    }
  })

  if (data.length > 1000) {
    warnings.push(`File contains ${data.length} rows. Large files may take longer to process.`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    recordCount: data.length
  }
}
