import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Search, Phone, Mail, Edit, Trash2, User } from "lucide-react";
import { useQuery, useMutation, apiRequest } from "@/lib/clientQueryClient";

interface CustomerManagementProps {
  onBack: () => void;
}

export default function CustomerManagementClient({ onBack }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    address: '',
    city: '',
    state: 'NJ',
    zip: '',
    preferredContact: 'phone',
    referralSource: '',
    notes: '',
    gateCodes: '',
    specialInstructions: '',
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading, refetch: refetchCustomers } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Filter customers based on search term
  const filteredCustomers = customers?.filter((customer: any) => 
    `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Reset form
  const resetForm = () => {
    setCustomerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      secondaryPhone: '',
      address: '',
      city: '',
      state: 'NJ',
      zip: '',
      preferredContact: 'phone',
      referralSource: '',
      notes: '',
      gateCodes: '',
      specialInstructions: '',
    });
    setEditingCustomer(null);
  };

  // Load customer data into form for editing
  const loadCustomerForEditing = (customer: any) => {
    setCustomerForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      secondaryPhone: customer.secondaryPhone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || 'NJ',
      zip: customer.zip || '',
      preferredContact: customer.preferredContact || 'phone',
      referralSource: customer.referralSource || '',
      notes: customer.notes || '',
      gateCodes: customer.gateCodes || '',
      specialInstructions: customer.specialInstructions || '',
    });
    setEditingCustomer(customer);
    setShowCustomerForm(true);
  };

  // Customer creation mutation
  const createCustomerMutation = useMutation({
    mutationFn: (customerData: any) => apiRequest('/api/customers', {
      method: 'POST',
      body: customerData,
    }),
    onSuccess: () => {
      refetchCustomers();
      setShowCustomerForm(false);
      resetForm();
    },
  });

  // Customer update mutation
  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, ...customerData }: any) => apiRequest(`/api/customers/${id}`, {
      method: 'PATCH',
      body: customerData,
    }),
    onSuccess: () => {
      refetchCustomers();
      setShowCustomerForm(false);
      resetForm();
    },
  });

  // Customer deletion mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/customers/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      refetchCustomers();
    },
  });

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerForm.firstName || !customerForm.lastName || !customerForm.phone) {
      alert('Please fill in all required fields (First Name, Last Name, Phone)');
      return;
    }

    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, ...customerForm });
    } else {
      createCustomerMutation.mutate(customerForm);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Customer Management</h1>
        </div>
        
        <Dialog open={showCustomerForm} onOpenChange={(open) => {
          setShowCustomerForm(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={customerForm.firstName}
                    onChange={(e) => setCustomerForm({...customerForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={customerForm.lastName}
                    onChange={(e) => setCustomerForm({...customerForm, lastName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                    placeholder="(123) 456-7890"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                  <Input
                    id="secondaryPhone"
                    value={customerForm.secondaryPhone}
                    onChange={(e) => setCustomerForm({...customerForm, secondaryPhone: e.target.value})}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                    placeholder="customer@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Select 
                      value={customerForm.state} 
                      onValueChange={(value) => setCustomerForm({...customerForm, state: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NJ">New Jersey</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={customerForm.zip}
                      onChange={(e) => setCustomerForm({...customerForm, zip: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredContact">Preferred Contact</Label>
                  <Select 
                    value={customerForm.preferredContact} 
                    onValueChange={(value) => setCustomerForm({...customerForm, preferredContact: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="referralSource">Referral Source</Label>
                  <Input
                    id="referralSource"
                    value={customerForm.referralSource}
                    onChange={(e) => setCustomerForm({...customerForm, referralSource: e.target.value})}
                    placeholder="e.g., Google, Referral, Facebook"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gateCodes">Gate Codes / Access Info</Label>
                <Input
                  id="gateCodes"
                  value={customerForm.gateCodes}
                  onChange={(e) => setCustomerForm({...customerForm, gateCodes: e.target.value})}
                  placeholder="Gate codes, key locations, access instructions"
                />
              </div>

              <div>
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  value={customerForm.specialInstructions}
                  onChange={(e) => setCustomerForm({...customerForm, specialInstructions: e.target.value})}
                  placeholder="Special handling instructions, pets, etc."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                  placeholder="Additional customer notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCustomerForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                >
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer: any) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h3 className="font-semibold text-lg">
                      {customer.firstName} {customer.lastName}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{formatPhoneNumber(customer.phone)}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="md:col-span-2">
                        <span>{customer.address}</span>
                        {customer.city && customer.state && (
                          <span>, {customer.city}, {customer.state} {customer.zip}</span>
                        )}
                      </div>
                    )}
                    {customer.referralSource && (
                      <div className="md:col-span-2">
                        <span className="text-blue-600">Referred by: {customer.referralSource}</span>
                      </div>
                    )}
                  </div>

                  {customer.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <strong>Notes:</strong> {customer.notes}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => loadCustomerForEditing(customer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this customer? This will also delete all associated jobs.')) {
                        deleteCustomerMutation.mutate(customer.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredCustomers.length === 0 && !customersLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? "No customers match your search criteria." 
                  : "No customers found. Add your first customer to get started."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}