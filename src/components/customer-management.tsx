import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Search, Phone, Mail, MapPin, Calendar, AlertCircle } from "lucide-react";
import { insertCustomerSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const customerFormSchema = insertCustomerSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
}).partial().extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

interface CustomerManagementProps {
  onBack: () => void;
}

export default function CustomerManagement({ onBack }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Customer form
  const customerForm = useForm({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {},
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setShowCustomerForm(false);
      customerForm.reset();
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setSelectedCustomer(null);
    },
  });

  // Filter customers
  const filteredCustomers = customers?.filter((customer: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.firstName.toLowerCase().includes(searchLower) ||
      customer.lastName.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  const onSubmitCustomer = (data: any) => {
    if (selectedCustomer) {
      updateCustomerMutation.mutate({ id: selectedCustomer.id, data });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
              <p className="text-gray-600 mt-1">Manage customer information and relationships</p>
            </div>
          </div>
          <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search customers by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {customersLoading ? "..." : customers?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {customersLoading ? "..." : 
                  customers?.filter((c: any) => {
                    const created = new Date(c.createdAt);
                    const now = new Date();
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
                  }).length || 0
                }
              </div>
              <p className="text-sm text-gray-500">New customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Repeat Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {customersLoading ? "..." : "0"}
              </div>
              <p className="text-sm text-gray-500">Coming soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Customers Grid */}
        {customersLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-500">Loading customers...</div>
          </div>
        ) : filteredCustomers?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <Phone className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Customers Found</h3>
                <p className="mb-4">
                  {customers?.length === 0 
                    ? "Add your first customer to get started."
                    : "No customers match your search criteria."
                  }
                </p>
                <Button onClick={() => setShowCustomerForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Customer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers?.map((customer: any) => (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{customer.phone}</span>
                          </span>
                          {customer.email && (
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{customer.email}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        {customer.claimsHistory && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Claims History
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            customerForm.reset(customer);
                            setShowCustomerForm(true);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Added {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {(customer.notes || customer.specialInstructions || customer.gateCodes) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {customer.notes && (
                          <div>
                            <p className="font-medium text-gray-700">Notes:</p>
                            <p className="text-gray-600">{customer.notes}</p>
                          </div>
                        )}
                        {customer.specialInstructions && (
                          <div>
                            <p className="font-medium text-gray-700">Special Instructions:</p>
                            <p className="text-gray-600">{customer.specialInstructions}</p>
                          </div>
                        )}
                        {customer.gateCodes && (
                          <div>
                            <p className="font-medium text-gray-700">Gate Codes:</p>
                            <p className="text-gray-600">{customer.gateCodes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Customer Form Dialog */}
        <Dialog open={showCustomerForm} onOpenChange={(open) => {
          setShowCustomerForm(open);
          if (!open) {
            setSelectedCustomer(null);
            customerForm.reset({});
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input {...customerForm.register("firstName")} />
                    {customerForm.formState.errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{customerForm.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input {...customerForm.register("lastName")} />
                    {customerForm.formState.errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{customerForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input {...customerForm.register("phone")} placeholder="(555) 123-4567" />
                    {customerForm.formState.errors.phone && (
                      <p className="text-red-600 text-sm mt-1">{customerForm.formState.errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                    <Input {...customerForm.register("secondaryPhone")} placeholder="(555) 987-6543" />
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" {...customerForm.register("email")} />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="font-medium mb-3">Additional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="referralSource">Referral Source</Label>
                    <Input {...customerForm.register("referralSource")} placeholder="e.g., Google, Friend, Website" />
                  </div>
                  <div>
                    <Label htmlFor="preferredContact">Preferred Contact</Label>
                    <select {...customerForm.register("preferredContact")} className="w-full p-2 border rounded">
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="notes">General Notes</Label>
                  <Textarea {...customerForm.register("notes")} placeholder="General notes about the customer" />
                </div>
                <div className="mt-4">
                  <Label htmlFor="specialInstructions">Special Instructions</Label>
                  <Textarea {...customerForm.register("specialInstructions")} placeholder="Special moving instructions or requirements" />
                </div>
                <div className="mt-4">
                  <Label htmlFor="gateCodes">Gate Codes / Access Information</Label>
                  <Input {...customerForm.register("gateCodes")} placeholder="Gate codes, key locations, etc." />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowCustomerForm(false);
                    setSelectedCustomer(null);
                    customerForm.reset({});
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                >
                  {createCustomerMutation.isPending || updateCustomerMutation.isPending 
                    ? "Saving..." 
                    : selectedCustomer ? "Update Customer" : "Add Customer"
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}