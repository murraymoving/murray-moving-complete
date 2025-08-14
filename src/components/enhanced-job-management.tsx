import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeft, Plus, Search, Calendar as CalendarIcon, MapPin, DollarSign, Users, Truck, 
  Clock, CheckCircle, Circle, AlertCircle, Filter, SortAsc, Eye, Edit, Trash2,
  Calculator, TrendingUp, FileText, Phone, Mail, Copy, ExternalLink, Briefcase
} from "lucide-react";
import { insertJobSchema, insertCustomerSchema, jobStatusEnum } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Enhanced schemas with better validation
const jobFormSchema = insertJobSchema.extend({
  title: z.string().min(1, "Job title is required"),
  originAddress: z.string().min(1, "Origin address is required"),
  destinationAddress: z.string().min(1, "Destination address is required"),
  crewSize: z.coerce.number().min(1, "At least 1 crew member required").max(5, "Maximum 5 crew members"),
  estimatedHours: z.coerce.number().min(0.5, "Minimum 0.5 hours").max(24, "Maximum 24 hours"),
  totalDistance: z.coerce.number().min(0, "Distance must be positive"),
  boxCountQuoted: z.coerce.number().min(0, "Box count must be positive"),
  mattressBagCount: z.coerce.number().min(0, "Mattress bag count must be positive"),
}).partial().extend({
  customerId: z.coerce.number().min(1, "Customer is required"),
  title: z.string().min(1, "Job title is required"),
  originAddress: z.string().min(1, "Origin address is required"),
  originCity: z.string().min(1, "Origin city is required"),
  originState: z.string().min(1, "Origin state is required"),
  originZip: z.string().min(1, "Origin zip is required"),
  destinationAddress: z.string().min(1, "Destination address is required"),
  destinationCity: z.string().min(1, "Destination city is required"),
  destinationState: z.string().min(1, "Destination state is required"),
  destinationZip: z.string().min(1, "Destination zip is required"),
});

const customerFormSchema = insertCustomerSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
}).partial().extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

interface EnhancedJobManagementProps {
  onBack: () => void;
}

// Pricing Calculator Component
const PricingCalculator = ({ jobData, onPricingChange }: any) => {
  const [pricing, setPricing] = useState({
    laborCost: 0,
    travelFee: 0,
    mileageFee: 0,
    mattressBagFee: 0,
    materialsCost: 0,
    totalEstimate: 0,
    breakdown: {}
  });

  // Murray Moving Official Tariff Rates
  const HOURLY_RATES = {
    1: 59.00,   // Labor Only (1 Mover): $59/hr
    2: 149.00,  // 2 Movers + Van/Truck: $149/hr
    3: 199.00,  // 3 Movers + Van/Truck: $199/hr
    4: 249.00,  // 4 Movers + Van/Truck: $249/hr
    5: 309.00,  // 5 Movers + Van/Truck: $309/hr
  };

  const LABOR_ONLY_RATES = {
    1: 59.00,   // Labor Only (1 Mover): $59/hr
    2: 85.00,   // Labor Only (2 Movers): $85/hr
  };

  const calculatePricing = () => {
    if (!jobData.crewSize || !jobData.estimatedHours) return;

    const crewSize = parseInt(jobData.crewSize);
    const hours = parseFloat(jobData.estimatedHours);
    const distance = parseFloat(jobData.totalDistance || 0);
    const isLaborOnly = jobData.isLaborOnly || false;
    const isOddJob = jobData.isOddJob || false;
    const isWeekend = jobData.isWeekend || false;
    const isHoliday = jobData.isHoliday || false;
    const mattressBags = parseInt(jobData.mattressBagCount || 0);
    const materialsCost = parseFloat(jobData.materialsCost || 0);

    // Calculate hourly rate
    let hourlyRate: number;
    if (isLaborOnly && crewSize <= 2) {
      hourlyRate = LABOR_ONLY_RATES[crewSize as keyof typeof LABOR_ONLY_RATES] || LABOR_ONLY_RATES[1];
    } else {
      hourlyRate = HOURLY_RATES[crewSize as keyof typeof HOURLY_RATES] || HOURLY_RATES[2];
    }

    // Calculate minimum hours based on season and crew size
    const now = new Date();
    const month = now.getMonth() + 1;
    const isBusySeason = month >= 5 && month <= 9; // May 2 - Sep 30
    
    let minimumHours: number;
    if (isOddJob) {
      minimumHours = 2.0;
    } else if (isBusySeason) {
      if (crewSize === 2) minimumHours = 4;
      else if (crewSize === 3) minimumHours = 6;
      else if (crewSize >= 4) minimumHours = 7;
      else minimumHours = 3;
    } else {
      if (crewSize === 2) minimumHours = 3;
      else if (crewSize === 3) minimumHours = 5;
      else if (crewSize >= 4) minimumHours = 6;
      else minimumHours = 3;
    }

    // Add weekend/holiday premiums to minimum hours
    if (isWeekend) minimumHours += 1; // Saturday
    if (isHoliday) minimumHours += 2; // Sunday/Holiday

    const billableHours = Math.max(hours, minimumHours);
    const laborCost = hourlyRate * billableHours;

    // Calculate travel fee: $99 base + $1.99/mile round trip
    const travelFee = 99 + (distance * 2 * 1.99);

    // Calculate mileage fee for over 50 miles
    const mileageFee = distance > 50 ? distance * 1.99 : 0;

    // Calculate mattress bag fee: $15/bag
    const mattressBagFee = mattressBags * 15;

    const totalEstimate = laborCost + travelFee + mileageFee + mattressBagFee + materialsCost;

    const newPricing = {
      laborCost,
      travelFee,
      mileageFee,
      mattressBagFee,
      materialsCost,
      totalEstimate,
      breakdown: {
        hourlyRate,
        minimumHours,
        actualHours: hours,
        billableHours,
        crewSize,
        isLaborOnly,
        isOddJob,
        isWeekend,
        isHoliday,
        isBusySeason,
        distance
      }
    };

    setPricing(newPricing);
    onPricingChange?.(newPricing);
  };

  useEffect(() => {
    calculatePricing();
  }, [jobData.crewSize, jobData.estimatedHours, jobData.totalDistance, jobData.isLaborOnly, 
      jobData.isOddJob, jobData.isWeekend, jobData.isHoliday, jobData.mattressBagCount, jobData.materialsCost]);

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-green-800">
          <Calculator className="w-5 h-5" />
          <span>Pricing Calculator</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Labor Cost:</span>
              <span className="font-bold text-green-700">${pricing.laborCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Travel Fee:</span>
              <span className="font-bold">${pricing.travelFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Mileage Fee:</span>
              <span className="font-bold">${pricing.mileageFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Mattress Bags:</span>
              <span className="font-bold">${pricing.mattressBagFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Materials:</span>
              <span className="font-bold">${pricing.materialsCost.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-green-800">Total Estimate</p>
                <p className="text-2xl font-bold text-green-900">${pricing.totalEstimate.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <p>Rate: ${(pricing.breakdown as any)?.hourlyRate || 0}/hr</p>
              <p>Min Hours: {(pricing.breakdown as any)?.minimumHours || 0}</p>
              <p>Billable: {(pricing.breakdown as any)?.billableHours || 0} hrs</p>
              <p>Season: {(pricing.breakdown as any)?.isBusySeason ? 'Busy' : 'Off'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EnhancedJobManagement({ onBack }: EnhancedJobManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("cards"); // cards, table, pipeline
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [pricingData, setPricingData] = useState<any>({});

  const queryClient = useQueryClient();

  // Fetch jobs with enhanced filtering
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs", searchTerm, statusFilter, sortBy, sortOrder],
    refetchInterval: 30000,
  });

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setShowCreateJob(false);
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create customer");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setShowCreateCustomer(false);
    },
  });

  // Job form
  const jobForm = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      description: "",
      customerId: 0,
      originAddress: "",
      originCity: "",
      originState: "NJ",
      originZip: "",
      destinationAddress: "",
      destinationCity: "",
      destinationState: "NJ", 
      destinationZip: "",
      crewSize: 2,
      estimatedHours: 4,
      totalDistance: 25,
      boxCountQuoted: 0,
      mattressBagCount: 0,
      materialsCost: 0,
      isLaborOnly: false,
      isOddJob: false,
      isWeekend: false,
      isHoliday: false,
    },
  });

  // Customer form
  const customerForm = useForm({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      notes: "",
    },
  });

  // Status management functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'lead': return <Circle className="w-4 h-4" />;
      case 'estimate': return <Clock className="w-4 h-4" />;
      case 'booked': return <CheckCircle className="w-4 h-4" />;
      case 'active': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paid': return <DollarSign className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-gray-100 text-gray-800';
      case 'estimate': return 'bg-blue-100 text-blue-800';
      case 'booked': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort jobs
  const filteredJobs = (jobs as any[])?.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) || [];

  // Create job handler
  const handleCreateJob = (data: any) => {
    const jobData = {
      ...data,
      ...pricingData,
    };
    createJobMutation.mutate(jobData);
  };

  // Create customer handler
  const handleCreateCustomer = (data: any) => {
    createCustomerMutation.mutate(data);
  };

  // Watch form changes for pricing calculator
  const watchedJobData = jobForm.watch();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Enhanced Job Management</h1>
            <p className="text-gray-600">Complete job pipeline with Murray Moving tariff pricing</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showCreateCustomer} onOpenChange={setShowCreateCustomer}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={customerForm.handleSubmit(handleCreateCustomer)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name</Label>
                    <Input {...customerForm.register("firstName")} />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input {...customerForm.register("lastName")} />
                  </div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input {...customerForm.register("phone")} placeholder="(555) 123-4567" />
                </div>
                <div>
                  <Label>Email (Optional)</Label>
                  <Input {...customerForm.register("email")} type="email" />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea {...customerForm.register("notes")} rows={3} />
                </div>
                <Button type="submit" className="w-full" disabled={createCustomerMutation.isPending}>
                  {createCustomerMutation.isPending ? "Creating..." : "Create Customer"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
              </DialogHeader>
              <form onSubmit={jobForm.handleSubmit(handleCreateJob)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="locations">Locations</TabsTrigger>
                    <TabsTrigger value="details">Job Details</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Customer</Label>
                        <Select onValueChange={(value) => jobForm.setValue("customerId", parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {(customers as any[])?.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.firstName} {customer.lastName} - {customer.phone}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Job Title</Label>
                        <Input {...jobForm.register("title")} placeholder="e.g., Local Move, Office Relocation" />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea {...jobForm.register("description")} rows={3} />
                    </div>
                  </TabsContent>

                  <TabsContent value="locations" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Origin</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label>Address</Label>
                            <Input {...jobForm.register("originAddress")} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>City</Label>
                              <Input {...jobForm.register("originCity")} />
                            </div>
                            <div>
                              <Label>State</Label>
                              <Input {...jobForm.register("originState")} defaultValue="NJ" />
                            </div>
                          </div>
                          <div>
                            <Label>Zip Code</Label>
                            <Input {...jobForm.register("originZip")} />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Destination</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label>Address</Label>
                            <Input {...jobForm.register("destinationAddress")} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>City</Label>
                              <Input {...jobForm.register("destinationCity")} />
                            </div>
                            <div>
                              <Label>State</Label>
                              <Input {...jobForm.register("destinationState")} defaultValue="NJ" />
                            </div>
                          </div>
                          <div>
                            <Label>Zip Code</Label>
                            <Input {...jobForm.register("destinationZip")} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Crew Size</Label>
                        <Select onValueChange={(value) => jobForm.setValue("crewSize", parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Mover</SelectItem>
                            <SelectItem value="2">2 Movers</SelectItem>
                            <SelectItem value="3">3 Movers</SelectItem>
                            <SelectItem value="4">4 Movers</SelectItem>
                            <SelectItem value="5">5 Movers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Estimated Hours</Label>
                        <Input {...jobForm.register("estimatedHours")} type="number" step="0.5" />
                      </div>
                      <div>
                        <Label>Distance (miles)</Label>
                        <Input {...jobForm.register("totalDistance")} type="number" step="0.1" />
                      </div>
                      <div>
                        <Label>Quoted Boxes</Label>
                        <Input {...jobForm.register("boxCountQuoted")} type="number" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label>Mattress Bags</Label>
                        <Input {...jobForm.register("mattressBagCount")} type="number" />
                      </div>
                      <div>
                        <Label>Materials Cost</Label>
                        <Input {...jobForm.register("materialsCost")} type="number" step="0.01" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch {...jobForm.register("isLaborOnly")} />
                        <Label>Labor Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch {...jobForm.register("isOddJob")} />
                        <Label>Odd Job</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch {...jobForm.register("isWeekend")} />
                        <Label>Weekend</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch {...jobForm.register("isHoliday")} />
                        <Label>Holiday</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <PricingCalculator 
                      jobData={watchedJobData} 
                      onPricingChange={setPricingData}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateJob(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createJobMutation.isPending}>
                    {createJobMutation.isPending ? "Creating..." : "Create Job"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search jobs, customers, job numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="lead">Leads</SelectItem>
                <SelectItem value="estimate">Estimates</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="preferredDate">Job Date</SelectItem>
                <SelectItem value="totalEstimate">Estimate</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              <SortAsc className={`w-4 h-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Display */}
      <div className="space-y-4">
        {jobsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">
                {searchTerm ? "No jobs found matching your search." : "No jobs created yet."}
              </p>
              <Button onClick={() => setShowCreateJob(true)} className="mt-4">
                Create First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mt-2">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ${job.totalEstimate || 0}
                      </p>
                      <p className="text-xs text-gray-500">{job.jobNumber}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{job.originCity} → {job.destinationCity}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{job.crewSize} movers</span>
                      <Clock className="w-4 h-4 text-gray-400 ml-2" />
                      <span>{job.estimatedHours}h</span>
                    </div>
                    {job.preferredDate && (
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{format(new Date(job.preferredDate), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Select 
                      value={job.status} 
                      onValueChange={(newStatus) => 
                        updateJobMutation.mutate({ id: job.id, data: { status: newStatus } })
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobStatusEnum.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}