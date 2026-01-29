import * as XLSX from 'xlsx'
import { ImportValidationError } from '@/types'

export interface ImportedRow {
  [key: string]: any
}

export class ImportService {
  static async validateExternalPricingFile(
    file: Buffer,
    requiredColumns: string[]
  ): Promise<{ valid: boolean; errors: ImportValidationError[]; data?: ImportedRow[] }> {
    const errors: ImportValidationError[] = []
    
    try {
      const workbook = XLSX.read(file, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data: ImportedRow[] = XLSX.utils.sheet_to_json(worksheet)
      
      if (data.length === 0) {
        errors.push({
          row: 0,
          column: 'file',
          value: null,
          error: 'File is empty or has no data rows',
        })
        return { valid: false, errors }
      }
      
      const fileColumns = Object.keys(data[0])
      const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col))
      
      if (missingColumns.length > 0) {
        errors.push({
          row: 0,
          column: 'headers',
          value: missingColumns,
          error: `Missing required columns: ${missingColumns.join(', ')}`,
        })
      }
      
      data.forEach((row, index) => {
        requiredColumns.forEach((column) => {
          if (row[column] === undefined || row[column] === null || row[column] === '') {
            errors.push({
              row: index + 2,
              column,
              error: 'Required field is empty',
              value: row[column],
            })
          }
        })
        
        if (row['Price'] && isNaN(parseFloat(row['Price']))) {
          errors.push({
            row: index + 2,
            column: 'Price',
            error: 'Price must be a valid number',
            value: row['Price'],
          })
        }
      })
      
      return {
        valid: errors.length === 0,
        errors,
        data: errors.length === 0 ? data : undefined,
      }
    } catch (error) {
      errors.push({
        row: 0,
        column: 'file',
        value: null,
        error: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
      return { valid: false, errors }
    }
  }
  
  static generateErrorReport(errors: ImportValidationError[]): string {
    let report = 'Import Validation Errors:\n\n'
    
    errors.forEach((error) => {
      report += `Row ${error.row}, Column "${error.column}": ${error.error}`
      if (error.value !== undefined) {
        report += ` (Value: ${error.value})`
      }
      report += '\n'
    })
    
    return report
  }
}
