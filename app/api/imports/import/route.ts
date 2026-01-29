import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const importRecord = await prisma.importHistory.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedById: userId,
        status: 'PROCESSING',
        startedAt: new Date(),
      }
    })

    try {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)

      let successCount = 0
      let failedCount = 0
      const errors: any[] = []

      for (let i = 0; i < data.length; i++) {
        const row: any = data[i]
        const rowNumber = i + 2

        try {
          const productCode = row['Product Code']?.toString().trim()
          const productName = row['Product Name']?.toString().trim()
          const basePrice = parseFloat(row['Base Price'])

          if (!productCode || !productName || isNaN(basePrice)) {
            throw new Error('Missing required fields')
          }

          await prisma.product.upsert({
            where: { materialCode: productCode },
            update: {
              name: productName,
              uom: row['UOM']?.toString() || 'EA',
              attributes: {
                basePrice: basePrice,
                minimumOrderQuantity: row['Minimum Order Quantity'] ? parseFloat(row['Minimum Order Quantity']) : null,
                effectiveDate: row['Effective Date'] ? new Date(row['Effective Date']) : null,
                expiryDate: row['Expiry Date'] ? new Date(row['Expiry Date']) : null,
                category: row['Category']?.toString() || null,
                description: row['Description']?.toString() || null,
              },
              updatedAt: new Date(),
            },
            create: {
              materialCode: productCode,
              name: productName,
              uom: row['UOM']?.toString() || 'EA',
              attributes: {
                basePrice: basePrice,
                minimumOrderQuantity: row['Minimum Order Quantity'] ? parseFloat(row['Minimum Order Quantity']) : null,
                effectiveDate: row['Effective Date'] ? new Date(row['Effective Date']) : null,
                expiryDate: row['Expiry Date'] ? new Date(row['Expiry Date']) : null,
                category: row['Category']?.toString() || null,
                description: row['Description']?.toString() || null,
              },
              active: true,
            }
          })

          successCount++
        } catch (error) {
          failedCount++
          errors.push({
            row: rowNumber,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: row
          })
        }
      }

      await prisma.importHistory.update({
        where: { id: importRecord.id },
        data: {
          status: failedCount === 0 ? 'SUCCESS' : (successCount > 0 ? 'PARTIAL' : 'FAILED'),
          recordsProcessed: data.length,
          recordsSuccess: successCount,
          recordsFailed: failedCount,
          errorDetails: errors.length > 0 ? errors : undefined,
          completedAt: new Date(),
        }
      })

      return NextResponse.json({
        success: true,
        importId: importRecord.id,
        recordsProcessed: data.length,
        recordsSuccess: successCount,
        recordsFailed: failedCount,
        errors: errors.length > 0 ? errors : null,
      })
    } catch (error) {
      await prisma.importHistory.update({
        where: { id: importRecord.id },
        data: {
          status: 'FAILED',
          errorDetails: {
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          completedAt: new Date(),
        }
      })

      throw error
    }
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to import data' 
      },
      { status: 500 }
    )
  }
}
