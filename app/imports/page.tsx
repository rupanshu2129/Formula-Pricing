'use client'

import dynamic from 'next/dynamic'
import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileUp, AlertCircle, CheckCircle, Upload, Loader2 } from 'lucide-react'


const ImportHistoryWidget = dynamic(
  () => import('@/components/import-history-widget').then(mod => ({ default: mod.ImportHistoryWidget })),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>Previous file uploads and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    ),
  }
)

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

export default function ImportsPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{success: boolean, message: string} | null>(null)
  const [historyKey, setHistoryKey] = useState(0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setValidationResult(null)
      setIsValidating(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/imports/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (data.validation) {
          setValidationResult(data.validation)
        } else {
          setValidationResult({
            valid: false,
            errors: [{ row: 0, column: 'File', error: data.error || 'Failed to validate file' }]
          })
        }
      } catch (error) {
        console.error('Error uploading file:', error)
        setValidationResult({
          valid: false,
          errors: [{ row: 0, column: 'File', error: 'Failed to upload file. Please try again.' }]
        })
      } finally {
        setIsValidating(false)
      }
    }
  }

  const handleImportData = async () => {
    if (!uploadedFile) {
      setImportResult({
        success: false,
        message: 'No file selected'
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('userId', 'system-user')

      const response = await fetch('/api/imports/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setImportResult({
          success: true,
          message: `Imported ${data.recordsSuccess} of ${data.recordsProcessed} records successfully.`
        })

        setUploadedFile(null)
        setValidationResult(null)

        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) {
          fileInput.value = ''
        }

        setHistoryKey(prev => prev + 1)
      } else {
        setImportResult({
          success: false,
          message: data.error || 'Failed to import data'
        })
      }
    } catch (error) {
      console.error('Error importing data:', error)
      setImportResult({
        success: false,
        message: 'An error occurred while importing data'
      })
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Imports</h1>
          <p className="text-muted-foreground">
            Upload and validate external pricing files
          </p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload External Pricing File</CardTitle>
          <CardDescription>
            Upload Excel files with pricing data. Files will be validated before import.
            <a
              href="/vap-pricing-template.xlsx"
              download
              className="ml-2 text-primary hover:underline inline-flex items-center"
            >
              Download Template
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {uploadedFile ? uploadedFile.name : 'Drop your file here or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: .xlsx, .xls
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button type="button" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </label>
          </div>
          
          {validationResult && (
            <Card className={validationResult.valid ? 'border-green-500' : 'border-red-500'}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {validationResult.valid ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <CardTitle className="text-lg">
                    {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {!validationResult.valid && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-red-600">
                      Found {validationResult.errors.length} error(s):
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {validationResult.errors.map((error: any, index: number) => (
                        <div key={index} className="text-sm bg-red-50 p-2 rounded">
                          <span className="font-medium">Row {error.row}, Column "{error.column}":</span>{' '}
                          {error.error}
                          {error.value && <span className="text-muted-foreground"> (Value: {error.value})</span>}
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4">
                      Download Error Report
                    </Button>
                  </div>
                )}
                {validationResult.valid && (
                  <div className="space-y-4">
                    <p className="text-sm text-green-600">
                      All validations passed. Ready to import.
                    </p>
                    <Button
                      className="w-full"
                      onClick={handleImportData}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        'Import Data'
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {importResult && (
            <Card className={importResult.success ? 'border-green-500' : 'border-red-500'}>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <CardTitle className="text-lg">
                    {importResult.success ? 'Import Successful' : 'Import Failed'}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className={`text-sm ${importResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {importResult.message}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      <ImportHistoryWidget key={historyKey} />
    </div>
  )
}
