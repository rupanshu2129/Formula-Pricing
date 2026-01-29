import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exportArtifact = await prisma.exportArtifact.findUnique({
      where: { id: params.id },
      include: {
        run: {
          include: {
            customer: true,
            template: true,
            products: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    if (!exportArtifact) {
      return NextResponse.json(
        { success: false, error: 'Export not found' },
        { status: 404 }
      )
    }

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet(exportArtifact.type === 'SAP' ? 'SAP Upload' : 'Pricing Export')

    if (exportArtifact.type === 'SAP') {
      worksheet.columns = [
        { header: 'Material', key: 'material', width: 15 },
        { header: 'Customer', key: 'customer', width: 15 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Currency', key: 'currency', width: 10 },
        { header: 'Valid From', key: 'validFrom', width: 15 },
        { header: 'Valid To', key: 'validTo', width: 15 },
        { header: 'Unit', key: 'unit', width: 10 },
      ]

      exportArtifact.run.products.forEach(runProduct => {
        worksheet.addRow({
          material: runProduct.product.materialCode,
          customer: exportArtifact.run.customer?.soldToId || '',
          price: runProduct.totalFOB || runProduct.fobPrice || 0,
          currency: 'USD',
          validFrom: exportArtifact.run.pricingPeriodStart.toISOString().split('T')[0],
          validTo: exportArtifact.run.pricingPeriodEnd.toISOString().split('T')[0],
          unit: runProduct.product.uom
        })
      })
    } else {
      worksheet.columns = [
        { header: 'Product Code', key: 'productCode', width: 15 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'UOM', key: 'uom', width: 10 },
        { header: 'FOB Price', key: 'fobPrice', width: 15 },
        { header: 'Delivered Price', key: 'deliveredPrice', width: 15 },
        { header: 'Total FOB', key: 'totalFOB', width: 15 },
      ]

      exportArtifact.run.products.forEach(runProduct => {
        worksheet.addRow({
          productCode: runProduct.product.materialCode,
          productName: runProduct.product.name,
          uom: runProduct.product.uom,
          fobPrice: runProduct.fobPrice || 0,
          deliveredPrice: runProduct.deliveredPrice || 0,
          totalFOB: runProduct.totalFOB || 0
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
        'Content-Disposition': `attachment; filename="${exportArtifact.fileName}"`
      }
    })
  } catch (error) {
    console.error('Error downloading export:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download export' },
      { status: 500 }
    )
  }
}
