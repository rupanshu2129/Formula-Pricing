import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const run = await prisma.pricingRun.findUnique({
      where: { id },
      include: {
        template: true,
        customer: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!run) {
      return NextResponse.json(
        { success: false, error: 'Pricing run not found' },
        { status: 404 }
      )
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pricing Run Results')

    worksheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 30 }
    ]

    worksheet.addRow({ field: 'Run Number', value: run.runNumber })
    worksheet.addRow({ field: 'Customer', value: run.customer?.name || 'N/A' })
    worksheet.addRow({ field: 'Pricing Model', value: run.template?.name || 'N/A' })
    worksheet.addRow({ field: 'Period Start', value: new Date(run.pricingPeriodStart).toLocaleDateString() })
    worksheet.addRow({ field: 'Period End', value: new Date(run.pricingPeriodEnd).toLocaleDateString() })
    worksheet.addRow({ field: 'Status', value: run.status })
    worksheet.addRow({ field: 'Created', value: new Date(run.createdAt).toLocaleString() })
    worksheet.addRow({ field: '', value: '' })

    if (run.inputSnapshot && typeof run.inputSnapshot === 'object') {
      const snapshot = run.inputSnapshot as any
      
      worksheet.addRow({ field: 'INPUT PARAMETERS', value: '' })
      if (snapshot.yield !== undefined) {
        worksheet.addRow({ field: 'Yield', value: `${snapshot.yield}%` })
      }
      if (snapshot.packaging !== undefined) {
        worksheet.addRow({ field: 'Packaging', value: `$${snapshot.packaging}` })
      }
      if (snapshot.freight !== undefined) {
        worksheet.addRow({ field: 'Freight', value: `$${snapshot.freight}` })
      }
      if (snapshot.conversion !== undefined) {
        worksheet.addRow({ field: 'Conversion', value: `$${snapshot.conversion}` })
      }
      if (snapshot.rebates !== undefined) {
        worksheet.addRow({ field: 'Rebates', value: `$${snapshot.rebates}` })
      }
      if (snapshot.paymentTermsRate !== undefined) {
        worksheet.addRow({ field: 'Payment Terms Rate', value: `${snapshot.paymentTermsRate}%` })
      }
      worksheet.addRow({ field: '', value: '' })

      if (snapshot.ingredients && Array.isArray(snapshot.ingredients)) {
        worksheet.addRow({ field: 'INGREDIENTS', value: '' })
        snapshot.ingredients.forEach((ing: any) => {
          worksheet.addRow({ 
            field: `  ${ing.name}`, 
            value: `${ing.recipePercent}% @ $${ing.marketPrice}/lb` 
          })
        })
        worksheet.addRow({ field: '', value: '' })
      }
    }

    if (run.products && run.products.length > 0) {
      worksheet.addRow({ field: 'PRODUCTS', value: '' })
      worksheet.addRow({ field: '', value: '' })

      const productsSheet = workbook.addWorksheet('Products')
      productsSheet.columns = [
        { header: 'Product Code', key: 'code', width: 15 },
        { header: 'Product Name', key: 'name', width: 30 },
        { header: 'UOM', key: 'uom', width: 10 },
        { header: 'FOB Price', key: 'fobPrice', width: 15 },
        { header: 'Total FOB', key: 'totalFOB', width: 15 },
        { header: 'Delivered Price', key: 'deliveredPrice', width: 15 },
      ]

      productsSheet.getRow(1).font = { bold: true }
      productsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }

      run.products.forEach((product: any) => {
        productsSheet.addRow({
          code: product.product?.materialCode || 'N/A',
          name: product.product?.name || 'N/A',
          uom: product.product?.uom || 'N/A',
          fobPrice: product.fobPrice ? `$${product.fobPrice.toFixed(2)}` : '$0.00',
          totalFOB: product.totalFOB ? `$${product.totalFOB.toFixed(2)}` : '$0.00',
          deliveredPrice: product.deliveredPrice ? `$${product.deliveredPrice.toFixed(2)}` : '$0.00',
        })
      })
    }

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pricing-run-${run.runNumber}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error exporting pricing run:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export pricing run' },
      { status: 500 }
    )
  }
}
