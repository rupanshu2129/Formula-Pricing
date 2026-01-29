import ExcelJS from 'exceljs'
import { PricingRun, PricingRunProduct, Product, Customer } from '@prisma/client'

export interface ExportData {
  run: PricingRun & {
    customer: Customer
    products: (PricingRunProduct & { product: Product })[]
  }
}

export class ExportService {
  static async generateSAPExport(data: ExportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('SAP Upload')
    
    worksheet.columns = [
      { header: 'Customer ID', key: 'customerId', width: 15 },
      { header: 'Material Code', key: 'materialCode', width: 15 },
      { header: 'FOB Price', key: 'fobPrice', width: 12 },
      { header: 'Total FOB', key: 'totalFOB', width: 12 },
      { header: 'Delivered Price', key: 'deliveredPrice', width: 15 },
      { header: 'Valid From', key: 'validFrom', width: 12 },
      { header: 'Valid To', key: 'validTo', width: 12 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'UOM', key: 'uom', width: 10 },
    ]
    
    data.run.products.forEach((product) => {
      worksheet.addRow({
        customerId: data.run.customer.soldToId,
        materialCode: product.product.materialCode,
        fobPrice: product.fobPrice,
        totalFOB: product.totalFOB,
        deliveredPrice: product.deliveredPrice,
        validFrom: data.run.pricingPeriodStart,
        validTo: data.run.pricingPeriodEnd,
        currency: 'USD',
        uom: product.product.uom,
      })
    })
    
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    }
    
    return await workbook.xlsx.writeBuffer() as unknown as Buffer
  }
  
  static async generateExcelExport(data: ExportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pricing Details')
    
    worksheet.mergeCells('A1:E1')
    worksheet.getCell('A1').value = 'VAP Formula Pricing - Customer Pricing Sheet'
    worksheet.getCell('A1').font = { bold: true, size: 14 }
    worksheet.getCell('A1').alignment = { horizontal: 'center' }
    
    worksheet.addRow([])
    worksheet.addRow(['Customer:', data.run.customer.name])
    worksheet.addRow(['Customer ID:', data.run.customer.soldToId])
    worksheet.addRow(['Pricing Period:', `${data.run.pricingPeriodStart.toLocaleDateString()} - ${data.run.pricingPeriodEnd.toLocaleDateString()}`])
    worksheet.addRow(['Run Number:', data.run.runNumber])
    worksheet.addRow([])
    
    const headerRow = worksheet.addRow([
      'Material Code',
      'Product Name',
      'Pre-Yield',
      'Post-Yield',
      'FOB Price',
      'Total FOB',
      'Delivered Price',
      'UOM',
    ])
    
    headerRow.font = { bold: true }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    }
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    
    data.run.products.forEach((product) => {
      worksheet.addRow([
        product.product.materialCode,
        product.product.name,
        product.preYieldSubtotal,
        product.postYieldSubtotal,
        product.fobPrice,
        product.totalFOB,
        product.deliveredPrice,
        product.product.uom,
      ])
    })
    
    worksheet.columns.forEach((column) => {
      if (column.key && ['preYield', 'postYield', 'fobPrice', 'totalFOB', 'deliveredPrice'].includes(column.key)) {
        column.numFmt = '$#,##0.00'
      }
    })
    
    return await workbook.xlsx.writeBuffer() as unknown as Buffer
  }
}
