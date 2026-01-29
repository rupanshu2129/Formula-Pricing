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
      calculatedPrice,
      runNumber 
    } = body

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('SAP Upload')

    worksheet.columns = [
      { header: 'Material', key: 'material', width: 15 },
      { header: 'Customer', key: 'customer', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Valid From', key: 'validFrom', width: 15 },
      { header: 'Valid To', key: 'validTo', width: 15 },
      { header: 'Unit', key: 'unit', width: 10 },
    ]

    worksheet.addRow({
      material: 'MAT-001',
      customer: customer || 'CUST-001',
      price: calculatedPrice?.totalFOB || '0.00',
      currency: 'USD',
      validFrom: periodStart || new Date().toISOString().split('T')[0],
      validTo: periodEnd || new Date().toISOString().split('T')[0],
      unit: 'LB'
    })

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
        'Content-Disposition': `attachment; filename="sap-upload-${runNumber || 'export'}.xlsx"`
      }
    })
  } catch (error) {
    console.error('Error generating SAP export:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate SAP export' },
      { status: 500 }
    )
  }
}
