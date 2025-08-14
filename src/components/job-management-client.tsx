import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Search, Calendar, MapPin, DollarSign, Users, Truck, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, apiRequest } from "@/lib/clientQueryClient";
import { clientStorage } from "@/lib/clientStorage";

const jobStatuses = ['lead', 'estimate', 'booked', 'active', 'completed', 'paid'] as const;

interface JobManagementProps {
  onBack: () => void;
}

export default function JobManagementClient({ onBack }: JobManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [editingJob, setEditingJob] = useState<any>(null);

  // Fetch jobs with filtering
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ["/api/jobs", statusFilter !== "all" ? { status: statusFilter } : {}],
  });

  // Fetch customers for the dropdown
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Filter jobs based on search term
  const filteredJobs = jobs?.filter((job: any) => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.destinationCity.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Job creation/update form state
  const [jobForm, setJobForm] = useState({
    customerId: '',
    title: '',
    description: '',
    status: 'lead' as const,
    originAddress: '',
    originCity: '',
    originState: 'NJ',
    originZip: '',
    destinationAddress: '',
    destinationCity: '',
    destinationState: 'NJ',
    destinationZip: '',
    preferredDate: '',
    preferredStartTime: '',
    crewSize: 2,
    estimatedHours: 4,
    hourlyRate: 149,
    totalCost: 0,
    jobType: 'residential',
    vehicleType: 'van',
    notes: '',
  });

  // Calculate total cost when form values change
  useEffect(() => {
    const cost = (jobForm.crewSize || 0) * (jobForm.estimatedHours || 0) * (jobForm.hourlyRate || 0);
    setJobForm(prev => ({ ...prev, totalCost: cost }));
  }, [jobForm.crewSize, jobForm.estimatedHours, jobForm.hourlyRate]);

  // Reset form
  const resetForm = () => {
    setJobForm({
      customerId: '',
      title: '',
      description: '',
      status: 'lead',
      originAddress: '',
      originCity: '',
      originState: 'NJ',
      originZip: '',
      destinationAddress: '',
      destinationCity: '',
      destinationState: 'NJ',
      destinationZip: '',
      preferredDate: '',
      preferredStartTime: '',
      crewSize: 2,
      estimatedHours: 4,
      hourlyRate: 149,
      totalCost: 0,
      jobType: 'residential',
      vehicleType: 'van',
      notes: '',
    });
    setEditingJob(null);
  };

  // Load job data into form for editing
  const loadJobForEditing = (job: any) => {
    setJobForm({
      customerId: job.customerId.toString(),
      title: job.title || '',
      description: job.description || '',
      status: job.status || 'lead',
      originAddress: job.originAddress || '',
      originCity: job.originCity || '',
      originState: job.originState || 'NJ',
      originZip: job.originZip || '',
      destinationAddress: job.destinationAddress || '',
      destinationCity: job.destinationCity || '',
      destinationState: job.destinationState || 'NJ',
      destinationZip: job.destinationZip || '',
      preferredDate: job.preferredDate || '',
      preferredStartTime: job.preferredStartTime || '',
      crewSize: job.crewSize || 2,
      estimatedHours: job.estimatedHours || 4,
      hourlyRate: job.hourlyRate || 149,
      totalCost: job.totalCost || 0,
      jobType: job.jobType || 'residential',
      vehicleType: job.vehicleType || 'van',
      notes: job.notes || '',
    });
    setEditingJob(job);
    setShowJobForm(true);
  };

  // Job creation mutation
  const createJobMutation = useMutation({
    mutationFn: (jobData: any) => apiRequest('/api/jobs', {
      method: 'POST',
      body: {
        ...jobData,
        customerId: parseInt(jobData.customerId),
      },
    }),
    onSuccess: () => {
      refetchJobs();
      setShowJobForm(false);
      resetForm();
    },
  });

  // Job update mutation
  const updateJobMutation = useMutation({
    mutationFn: ({ id, ...jobData }: any) => apiRequest(`/api/jobs/${id}`, {
      method: 'PATCH',
      body: {
        ...jobData,
        customerId: parseInt(jobData.customerId),
      },
    }),
    onSuccess: () => {
      refetchJobs();
      setShowJobForm(false);
      resetForm();
    },
  });

  // Job deletion mutation
  const deleteJobMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/jobs/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      refetchJobs();
      setSelectedJob(null);
    },
  });

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!jobForm.customerId || !jobForm.title || !jobForm.originAddress || !jobForm.destinationAddress) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, ...jobForm });
    } else {
      createJobMutation.mutate(jobForm);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-gray-100 text-gray-800';
      case 'estimate': return 'bg-yellow-100 text-yellow-800';
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Job Management</h1>
        </div>
        
        <Dialog open={showJobForm} onOpenChange={(open) => {
          setShowJobForm(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitJob} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  <Select 
                    value={jobForm.customerId} 
                    onValueChange={(value) => setJobForm({...jobForm, customerId: value})}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                    placeholder="e.g., 3BR House Move"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={jobForm.status} 
                    onValueChange={(value: any) => setJobForm({...jobForm, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {jobStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredDate">Preferred Date</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={jobForm.preferredDate}
                    onChange={(e) => setJobForm({...jobForm, preferredDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Origin Address */}
              <div className="space-y-2">
                <h3 className="font-semibold">Origin Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="originAddress">Street Address *</Label>
                    <Input
                      id="originAddress"
                      value={jobForm.originAddress}
                      onChange={(e) => setJobForm({...jobForm, originAddress: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originCity">City *</Label>
                    <Input
                      id="originCity"
                      value={jobForm.originCity}
                      onChange={(e) => setJobForm({...jobForm, originCity: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originState">State</Label>
                    <Select 
                      value={jobForm.originState} 
                      onValueChange={(value) => setJobForm({...jobForm, originState: value})}
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
                    <Label htmlFor="originZip">ZIP Code</Label>
                    <Input
                      id="originZip"
                      value={jobForm.originZip}
                      onChange={(e) => setJobForm({...jobForm, originZip: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Destination Address */}
              <div className="space-y-2">
                <h3 className="font-semibold">Destination Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="destinationAddress">Street Address *</Label>
                    <Input
                      id="destinationAddress"
                      value={jobForm.destinationAddress}
                      onChange={(e) => setJobForm({...jobForm, destinationAddress: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationCity">City *</Label>
                    <Input
                      id="destinationCity"
                      value={jobForm.destinationCity}
                      onChange={(e) => setJobForm({...jobForm, destinationCity: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="destinationState">State</Label>
                    <Select 
                      value={jobForm.destinationState} 
                      onValueChange={(value) => setJobForm({...jobForm, destinationState: value})}
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
                    <Label htmlFor="destinationZip">ZIP Code</Label>
                    <Input
                      id="destinationZip"
                      value={jobForm.destinationZip}
                      onChange={(e) => setJobForm({...jobForm, destinationZip: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-2">
                <h3 className="font-semibold">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="crewSize">Crew Size</Label>
                    <Input
                      id="crewSize"
                      type="number"
                      min="1"
                      max="5"
                      value={jobForm.crewSize}
                      onChange={(e) => setJobForm({...jobForm, crewSize: parseInt(e.target.value) || 2})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={jobForm.estimatedHours}
                      onChange={(e) => setJobForm({...jobForm, estimatedHours: parseFloat(e.target.value) || 4})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      value={jobForm.hourlyRate}
                      onChange={(e) => setJobForm({...jobForm, hourlyRate: parseInt(e.target.value) || 149})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <Select 
                      value={jobForm.vehicleType} 
                      onValueChange={(value) => setJobForm({...jobForm, vehicleType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select 
                      value={jobForm.jobType} 
                      onValueChange={(value) => setJobForm({...jobForm, jobType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="totalCost">Total Cost</Label>
                    <Input
                      id="totalCost"
                      value={formatCurrency(jobForm.totalCost)}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={jobForm.notes}
                  onChange={(e) => setJobForm({...jobForm, notes: e.target.value})}
                  placeholder="Additional job notes..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  placeholder="Job description..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowJobForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createJobMutation.isPending || updateJobMutation.isPending}
                >
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {jobStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Jobs List */}
      <div className="grid gap-4">
        {filteredJobs.map((job: any) => (
          <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.originCity}, {job.originState} → {job.destinationCity}, {job.destinationState}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {job.preferredDate || 'Date TBD'}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {job.crewSize} crew members
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.totalCost ? formatCurrency(job.totalCost) : 'Price TBD'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      loadJobForEditing(job);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this job?')) {
                        deleteJobMutation.mutate(job.id);
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
        
        {filteredJobs.length === 0 && !jobsLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No jobs match your search criteria." 
                  : "No jobs found. Create your first job to get started."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}