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
import { ArrowLeft, Plus, Search, Calendar, MapPin, DollarSign, Users, Truck } from "lucide-react";
import { insertJobSchema, insertCustomerSchema, jobStatusEnum } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Pricing calculations will be handled by the backend

const jobFormSchema = insertJobSchema.extend({
  // Make required fields more user-friendly
  title: z.string().min(1, "Job title is required"),
  originAddress: z.string().min(1, "Origin address is required"),
  destinationAddress: z.string().min(1, "Destination address is required"),
  crewSize: z.coerce.number().min(1).max(5),
  estimatedHours: z.coerce.number().min(0.5),
  totalDistance: z.coerce.number().min(0),
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
}).partial().extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
});

interface JobManagementProps {
  onBack: () => void;
}

export default function JobManagement({ onBack }: JobManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showJobForm, setShowJobForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["/api/jobs", statusFilter !== "all" ? { status: statusFilter } : {}],
  });

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Job form
  const jobForm = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      crewSize: 2,
      estimatedHours: 4,
      totalDistance: 25,
      boxCountQuoted: 0,
      mattressBagCount: 0,
    },
  });

  // Customer form
  const customerForm = useForm({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {},
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowJobForm(false);
      jobForm.reset();
    },
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

  // Update job status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/jobs/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update job status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  // Calculate pricing when form values change
  const watchedValues = jobForm.watch();
  const [pricing, setPricing] = useState<any>(null);
  
  // Calculate pricing using official Murray Moving Tariff rates
  const calculatePricing = (values: any) => {
    if (!values.crewSize || !values.estimatedHours || !values.totalDistance) return null;
    
    const crewSize = parseInt(values.crewSize) || 2;
    const estimatedHours = parseFloat(values.estimatedHours) || 0;
    const distanceMiles = parseFloat(values.totalDistance) || 0;
    const mattressBags = parseInt(values.mattressBagCount) || 0;
    const materialsCost = parseFloat(values.materialsCost) || 0;
    const isOddJob = values.isOddJob || false;
    const isLaborOnly = values.isLaborOnly || false;
    const isWeekend = values.isWeekend || false;
    const isHoliday = values.isHoliday || false;
    
    // Official Murray Moving Tariff Rates
    const hourlyRates = { 
      1: 59,   // Labor Only (1 Mover): $59/hr
      2: 149,  // 2 Movers + Van/Truck: $149/hr
      3: 199,  // 3 Movers + Van/Truck: $199/hr
      4: 249,  // 4 Movers + Van/Truck: $249/hr
      5: 309   // 4 + Additional Mover ($60/hr)
    };
    
    const laborOnlyRates = {
      1: 59,   // Labor Only (1 Mover): $59/hr
      2: 85    // Labor Only (2 Movers): $85/hr
    };
    
    // Get the right hourly rate
    let hourlyRate: number;
    if (isLaborOnly && crewSize <= 2) {
      hourlyRate = laborOnlyRates[crewSize as keyof typeof laborOnlyRates] || 59;
    } else {
      hourlyRate = hourlyRates[crewSize as keyof typeof hourlyRates] || 149;
    }
    
    // Calculate minimum hours based on tariff
    let minimumHours: number;
    if (isOddJob) {
      minimumHours = 2.0; // Reduced minimum for odd jobs
    } else {
      // Determine season (May 2 - Sep 30 is busy season)
      const now = new Date();
      const month = now.getMonth() + 1;
      const isBusySeason = month >= 5 && month <= 9;
      
      if (isBusySeason) {
        // May 2 - September 30
        if (crewSize === 2) minimumHours = 4;
        else if (crewSize === 3) minimumHours = 6;
        else if (crewSize >= 4) minimumHours = 7;
        else minimumHours = 3;
      } else {
        // October 1 - May 1
        if (crewSize === 2) minimumHours = 3;
        else if (crewSize === 3) minimumHours = 5;
        else if (crewSize >= 4) minimumHours = 6;
        else minimumHours = 3;
      }
      
      // Weekend/holiday adjustments
      if (isWeekend) minimumHours += 1;
      if (isHoliday) minimumHours += 2;
    }
    
    const billableHours = Math.max(estimatedHours, minimumHours);
    const laborCost = hourlyRate * billableHours;
    
    // Travel Fee: $99 flat + $1.99/mi (round trip)
    const travelBaseFee = 99;
    const travelMileageRate = 1.99;
    const roundTripDistance = distanceMiles * 2;
    const travelFee = travelBaseFee + (roundTripDistance * travelMileageRate);
    
    // Mileage fee for over 50 miles
    const mileageFee = distanceMiles > 50 ? distanceMiles * travelMileageRate : 0;
    
    // Mattress bag fee: $15 per bag
    const mattressBagCost = mattressBags * 15;
    
    const totalEstimate = laborCost + travelFee + mileageFee + mattressBagCost + materialsCost;
    
    return {
      laborCost,
      travelFee,
      mileageFee,
      mattressBagFee: mattressBagCost,
      materialsCost,
      totalEstimate,
      breakdown: {
        hourlyRate,
        minimumHours,
        billableHours,
        isOddJob,
        isLaborOnly,
        jobType: isOddJob ? 'Odd Job' : isLaborOnly ? 'Labor Only' : 'Full Service'
      }
    };
  };
  
  // Update pricing when form values change (including new tariff options)
  React.useEffect(() => {
    const newPricing = calculatePricing(watchedValues);
    setPricing(newPricing);
  }, [watchedValues.crewSize, watchedValues.estimatedHours, watchedValues.totalDistance, watchedValues.boxCountQuoted, watchedValues.mattressBagCount, watchedValues.materialsCost, watchedValues.isOddJob, watchedValues.isLaborOnly, watchedValues.isWeekend, watchedValues.isHoliday]);

  // Filter jobs
  const filteredJobs = jobs?.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${job.originCity}, ${job.originState}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${job.destinationCity}, ${job.destinationState}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'lead': 'bg-gray-100 text-gray-800',
      'estimate': 'bg-blue-100 text-blue-800',
      'booked': 'bg-green-100 text-green-800',
      'active': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-purple-100 text-purple-800',
      'paid': 'bg-emerald-100 text-emerald-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const onSubmitJob = (data: any) => {
    // Add calculated pricing to the job data
    if (pricing) {
      const jobData = {
        ...data,
        laborCost: pricing.laborCost.toString(),
        travelFee: pricing.travelFee.toString(),
        mileageFee: pricing.mileageFee.toString(),
        mattressBagFee: pricing.mattressBagFee.toString(),
        totalEstimate: pricing.totalEstimate.toString(),
      };
      createJobMutation.mutate(jobData);
    } else {
      createJobMutation.mutate(data);
    }
  };

  const onSubmitCustomer = (data: any) => {
    createCustomerMutation.mutate(data);
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
              <h1 className="text-3xl font-bold text-gray-900">Job Pipeline Management</h1>
              <p className="text-gray-600 mt-1">Manage jobs from lead to payment</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search jobs by title, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {jobStatusEnum.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        {jobsLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-gray-500">Loading jobs...</div>
          </div>
        ) : filteredJobs?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Jobs Found</h3>
                <p className="mb-4">
                  {jobs?.length === 0 
                    ? "Create your first job to get started with the pipeline."
                    : "No jobs match your current filters."
                  }
                </p>
                <Button onClick={() => setShowJobForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Job
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs?.map((job: any) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-gray-600">Job #{job.jobNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 text-lg">
                        ${Number(job.totalEstimate || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">Estimate</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">From</p>
                        <p className="text-sm">{job.originCity}, {job.originState}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">To</p>
                        <p className="text-sm">{job.destinationCity}, {job.destinationState}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">Crew Size</p>
                        <p className="text-sm">{job.crewSize || 'TBD'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p className="text-sm">
                          {job.preferredDate ? new Date(job.preferredDate).toLocaleDateString() : 'TBD'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Created {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex space-x-2">
                      <Select
                        value={job.status}
                        onValueChange={(status) => updateStatusMutation.mutate({ id: job.id, status })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {jobStatusEnum.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Job Creation Dialog */}
        <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <form onSubmit={jobForm.handleSubmit(onSubmitJob)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="locations">Locations</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input {...jobForm.register("title")} placeholder="e.g., Residential Move - Smith Family" />
                      {jobForm.formState.errors.title && (
                        <p className="text-red-600 text-sm mt-1">{jobForm.formState.errors.title.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="customerId">Customer</Label>
                      <Select onValueChange={(value) => jobForm.setValue("customerId", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers?.map((customer: any) => (
                            <SelectItem key={customer.id} value={customer.id.toString()}>
                              {customer.firstName} {customer.lastName} - {customer.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {jobForm.formState.errors.customerId && (
                        <p className="text-red-600 text-sm mt-1">{jobForm.formState.errors.customerId.message}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea {...jobForm.register("description")} placeholder="Job details and special requirements" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="crewSize">Crew Size</Label>
                      <Select onValueChange={(value) => jobForm.setValue("crewSize", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crew size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Person</SelectItem>
                          <SelectItem value="2">2 People</SelectItem>
                          <SelectItem value="3">3 People</SelectItem>
                          <SelectItem value="4">4 People</SelectItem>
                          <SelectItem value="5">5 People</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        type="number"
                        step="0.5"
                        {...jobForm.register("estimatedHours")}
                        placeholder="4.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalDistance">Distance (miles)</Label>
                      <Input
                        type="number"
                        {...jobForm.register("totalDistance")}
                        placeholder="25"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="locations" className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Origin (Pickup)</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <Input {...jobForm.register("originAddress")} placeholder="Street Address" />
                      <div className="grid grid-cols-3 gap-4">
                        <Input {...jobForm.register("originCity")} placeholder="City" />
                        <Input {...jobForm.register("originState")} placeholder="State" />
                        <Input {...jobForm.register("originZip")} placeholder="ZIP" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Destination (Delivery)</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <Input {...jobForm.register("destinationAddress")} placeholder="Street Address" />
                      <div className="grid grid-cols-3 gap-4">
                        <Input {...jobForm.register("destinationCity")} placeholder="City" />
                        <Input {...jobForm.register("destinationState")} placeholder="State" />
                        <Input {...jobForm.register("destinationZip")} placeholder="ZIP" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="boxCountQuoted">Quoted Boxes</Label>
                      <Input type="number" {...jobForm.register("boxCountQuoted")} placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="mattressBagCount">Mattress Bags</Label>
                      <Input type="number" {...jobForm.register("mattressBagCount")} placeholder="0" />
                    </div>
                    <div>
                      <Label htmlFor="materialsCost">Materials Cost ($)</Label>
                      <Input type="number" step="0.01" {...jobForm.register("materialsCost")} placeholder="0.00" />
                    </div>
                  </div>
                  
                  {/* Tariff Job Type Options */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3 text-green-800">Job Type Options (Murray Moving Tariff)</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isOddJob"
                          {...jobForm.register("isOddJob")}
                          className="h-4 w-4 text-green-600"
                        />
                        <Label htmlFor="isOddJob" className="text-sm">
                          Odd Job / Van-Only (Reduced Minimum)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isLaborOnly"
                          {...jobForm.register("isLaborOnly")}
                          className="h-4 w-4 text-green-600"
                        />
                        <Label htmlFor="isLaborOnly" className="text-sm">
                          Labor Only (Special Rates)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isWeekend"
                          {...jobForm.register("isWeekend")}
                          className="h-4 w-4 text-green-600"
                        />
                        <Label htmlFor="isWeekend" className="text-sm">
                          Weekend (+1 hour minimum)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isHoliday"
                          {...jobForm.register("isHoliday")}
                          className="h-4 w-4 text-green-600"
                        />
                        <Label htmlFor="isHoliday" className="text-sm">
                          Holiday/Sunday (+2 hours minimum)
                        </Label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      These options follow your official tariff rate structure and minimum hour requirements.
                    </p>
                  </div>
                  
                  {pricing && (
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-green-800">Official Tariff Pricing</CardTitle>
                        {pricing.breakdown && (
                          <p className="text-sm text-green-700">
                            {pricing.breakdown.jobType} • ${pricing.breakdown.hourlyRate}/hr • {pricing.breakdown.billableHours}h min
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span>Labor Cost:</span>
                          <span className="font-medium">${pricing.laborCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Travel Fee:</span>
                          <span className="font-medium">${pricing.travelFee.toFixed(2)}</span>
                        </div>
                        {pricing.mileageFee > 0 && (
                          <div className="flex justify-between">
                            <span>Mileage Fee (Over 50mi):</span>
                            <span className="font-medium">${pricing.mileageFee.toFixed(2)}</span>
                          </div>
                        )}
                        {pricing.mattressBagFee > 0 && (
                          <div className="flex justify-between">
                            <span>Mattress Bags:</span>
                            <span className="font-medium">${pricing.mattressBagFee.toFixed(2)}</span>
                          </div>
                        )}
                        {pricing.materialsCost > 0 && (
                          <div className="flex justify-between">
                            <span>Materials:</span>
                            <span className="font-medium">${pricing.materialsCost.toFixed(2)}</span>
                          </div>
                        )}
                        <hr className="border-green-300" />
                        <div className="flex justify-between text-lg font-bold text-green-800">
                          <span>Total Estimate:</span>
                          <span>${pricing.totalEstimate.toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowJobForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createJobMutation.isPending}>
                  {createJobMutation.isPending ? "Creating..." : "Create Job"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Customer Creation Dialog */}
        <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <form onSubmit={customerForm.handleSubmit(onSubmitCustomer)} className="space-y-4">
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
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input {...customerForm.register("phone")} placeholder="(555) 123-4567" />
                {customerForm.formState.errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{customerForm.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input type="email" {...customerForm.register("email")} />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCustomerForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCustomerMutation.isPending}>
                  {createCustomerMutation.isPending ? "Adding..." : "Add Customer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}