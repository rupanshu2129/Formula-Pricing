'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Users, Edit, Trash2, Plus, X } from 'lucide-react'

interface Customer {
  id: string
  soldToId: string
  name: string
  active: boolean
}

interface Segment {
  id: string
  name: string
  description: string | null
  customerCount: number
  customers: Array<{
    id: string
    name: string
    soldToId: string
  }>
}

interface CustomerWithSegment extends Customer {
  segment?: string
  segmentId?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithSegment[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState('')
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false)
  const [isEditSegmentOpen, setIsEditSegmentOpen] = useState(false)
  const [isAssignCustomerOpen, setIsAssignCustomerOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [newSegmentName, setNewSegmentName] = useState('')
  const [newSegmentDescription, setNewSegmentDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [customersRes, segmentsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/segments')
      ])

      const customersData = await customersRes.json()
      const segmentsData = await segmentsRes.json()

      if (customersData.success) {
        const customersWithSegments = customersData.customers.map((customer: Customer) => {
          const segment = segmentsData.segments?.find((s: Segment) =>
            s.customers.some(c => c.id === customer.id)
          )
          return {
            ...customer,
            segment: segment?.name,
            segmentId: segment?.id
          }
        })
        setCustomers(customersWithSegments)
      }

      if (segmentsData.success) {
        setSegments(segmentsData.segments || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    }
  }

  const handleCreateSegment = async () => {
    if (!newSegmentName.trim()) {
      setError('Segment name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSegmentName,
          description: newSegmentDescription
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsCreateSegmentOpen(false)
        setNewSegmentName('')
        setNewSegmentDescription('')
        fetchData()
      } else {
        setError(data.error || 'Failed to create segment')
      }
    } catch (error) {
      console.error('Error creating segment:', error)
      setError('Failed to create segment')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSegment = async () => {
    if (!selectedSegment || !newSegmentName.trim()) {
      setError('Segment name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/segments/${selectedSegment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSegmentName,
          description: newSegmentDescription
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsEditSegmentOpen(false)
        setSelectedSegment(null)
        setNewSegmentName('')
        setNewSegmentDescription('')
        fetchData()
      } else {
        setError(data.error || 'Failed to update segment')
      }
    } catch (error) {
      console.error('Error updating segment:', error)
      setError('Failed to update segment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSegment = async (segmentId: string) => {
    if (!confirm('Are you sure you want to delete this segment? All customer assignments will be removed.')) {
      return
    }

    try {
      const response = await fetch(`/api/segments/${segmentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchData()
      } else {
        setError(data.error || 'Failed to delete segment')
      }
    } catch (error) {
      console.error('Error deleting segment:', error)
      setError('Failed to delete segment')
    }
  }

  const handleAssignCustomer = async (customerId: string, segmentId: string) => {
    try {
      const response = await fetch('/api/customer-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, segmentId })
      })

      const data = await response.json()

      if (data.success) {
        fetchData()
      } else {
        setError(data.error || 'Failed to assign customer')
      }
    } catch (error) {
      console.error('Error assigning customer:', error)
      setError('Failed to assign customer')
    }
  }

  const handleUnassignCustomer = async (customerId: string, segmentId: string) => {
    try {
      const response = await fetch(`/api/customer-assignments?customerId=${customerId}&segmentId=${segmentId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchData()
      } else {
        setError(data.error || 'Failed to unassign customer')
      }
    } catch (error) {
      console.error('Error unassigning customer:', error)
      setError('Failed to unassign customer')
    }
  }

  const openEditSegment = (segment: Segment) => {
    setSelectedSegment(segment)
    setNewSegmentName(segment.name)
    setNewSegmentDescription(segment.description || '')
    setIsEditSegmentOpen(true)
    setError('')
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.soldToId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSegment = !selectedSegmentFilter || customer.segmentId === selectedSegmentFilter
    return matchesSearch && matchesSegment
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Grouping</h1>
          <p className="text-muted-foreground">
            Manage customer segments and assignments
          </p>
        </div>
        <Button onClick={() => {
          setIsCreateSegmentOpen(true)
          setError('')
        }}>
          <Users className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      </div>

      {isCreateSegmentOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Segment</CardTitle>
              <CardDescription>Add a new customer segment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Segment Name *</label>
                <Input
                  placeholder="e.g., Premium Customers"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Optional description"
                  value={newSegmentDescription}
                  onChange={(e) => setNewSegmentDescription(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateSegmentOpen(false)
                    setNewSegmentName('')
                    setNewSegmentDescription('')
                    setError('')
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateSegment} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Segment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isEditSegmentOpen && selectedSegment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Segment</CardTitle>
              <CardDescription>Update segment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Segment Name *</label>
                <Input
                  placeholder="e.g., Premium Customers"
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Optional description"
                  value={newSegmentDescription}
                  onChange={(e) => setNewSegmentDescription(e.target.value)}
                />
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditSegmentOpen(false)
                    setSelectedSegment(null)
                    setNewSegmentName('')
                    setNewSegmentDescription('')
                    setError('')
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateSegment} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Segment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{segment.name}</CardTitle>
                  <CardDescription>{segment.customerCount} customers</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditSegment(segment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSegment(segment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {segment.description && (
                  <p className="text-sm text-muted-foreground">{segment.description}</p>
                )}
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Customers:</p>
                  {segment.customers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No customers assigned</p>
                  ) : (
                    <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                      {segment.customers.map((customer) => (
                        <li key={customer.id} className="flex items-center justify-between">
                          <span>• {customer.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnassignCustomer(customer.id, segment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Master</CardTitle>
          <CardDescription>Search and manage customer assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name or ID..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedSegmentFilter}
                onChange={(e) => setSelectedSegmentFilter(e.target.value)}
              >
                <option value="">All Segments</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border rounded-lg">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Customer ID</th>
                    <th className="text-left p-3 text-sm font-medium">Name</th>
                    <th className="text-left p-3 text-sm font-medium">Segment</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-t">
                        <td className="p-3 text-sm">{customer.soldToId}</td>
                        <td className="p-3 text-sm font-medium">{customer.name}</td>
                        <td className="p-3 text-sm">
                          {customer.segment ? (
                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                              {customer.segment}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Unassigned</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          <select
                            className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs"
                            value={customer.segmentId || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                if (customer.segmentId) {
                                  handleUnassignCustomer(customer.id, customer.segmentId)
                                }
                                handleAssignCustomer(customer.id, e.target.value)
                              } else if (customer.segmentId) {
                                handleUnassignCustomer(customer.id, customer.segmentId)
                              }
                            }}
                          >
                            <option value="">Assign to segment...</option>
                            {segments.map((segment) => (
                              <option key={segment.id} value={segment.id}>
                                {segment.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
