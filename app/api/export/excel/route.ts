import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customer, 
      model, 
      periodStart, 
      periodEnd, 
      ingredients, 
      calculatedPrice,
      runNumber 
    } = body

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pricing Run')

    worksheet.columns = [
      { header: 'Field', key: 'field', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ]

    worksheet.addRow({ field: 'Run Number', value: runNumber || 'N/A' })
    worksheet.addRow({ field: 'Customer', value: customer || 'N/A' })
    worksheet.addRow({ field: 'Model', value: model || 'N/A' })
    worksheet.addRow({ field: 'Period Start', value: periodStart || 'N/A' })
    worksheet.addRow({ field: 'Period End', value: periodEnd || 'N/A' })
    worksheet.addRow({ field: '', value: '' })

    worksheet.addRow({ field: 'INGREDIENTS', value: '' })
    ingredients?.forEach((ing: any) => {
      worksheet.addRow({ 
        field: `  ${ing.name}`, 
        value: `${ing.recipePercent}% @ $${ing.costPerLb}/lb` 
      })
    })
    worksheet.addRow({ field: '', value: '' })

    worksheet.addRow({ field: 'CALCULATION RESULTS', value: '' })
    worksheet.addRow({ field: 'Pre-Yield Subtotal', value: `$${calculatedPrice?.preYieldSubtotal || '0.00'}` })
    worksheet.addRow({ field: 'Post-Yield Subtotal', value: `$${calculatedPrice?.postYieldSubtotal || '0.00'}` })
    worksheet.addRow({ field: 'FOB Price', value: `$${calculatedPrice?.fobPrice || '0.00'}` })
    worksheet.addRow({ field: 'Total FOB (with terms)', value: `$${calculatedPrice?.totalFOB || '0.00'}` })

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(7).font = { bold: true }
    worksheet.getRow(7 + (ingredients?.length || 0) + 2).font = { bold: true }

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pricing-run-${runNumber || 'export'}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error generating Excel export:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate Excel export' },
      { status: 500 }
    )
  }
}
