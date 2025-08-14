import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Briefcase, Calendar, DollarSign, TrendingUp, 
  Clock, CheckCircle, Circle, AlertCircle, MapPin, Phone, Lock, Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import JobManagement from "@/components/job-management";
import EnhancedJobManagement from "@/components/enhanced-job-management";
import CustomerManagement from "@/components/customer-management";
import { ExportManager } from "@/components/export-manager";
import { CustomizableDashboard } from "@/components/customizable-dashboard";
import newLogoPath from "@assets/phonto 2_1752189305081.jpg";

// Declare global MURRAY_AUTH for TypeScript
declare global {
  interface Window {
    MURRAY_AUTH: {
      isAuthenticated: () => boolean;
      login: (username: string, password: string) => { success: boolean };
      logout: () => void;
    };
  }
}

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  // Dashboard stats - always call hooks
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isAuthenticated, // Only run when authenticated
  });

  // Monthly financials
  const { data: financials, isLoading: financialsLoading } = useQuery({
    queryKey: ["/api/dashboard/financials"],
    refetchInterval: 60000, // Refresh every minute
    enabled: isAuthenticated,
  });

  // Recent jobs for dashboard
  const { data: recentJobs } = useQuery({
    queryKey: ["/api/jobs"],
    enabled: isAuthenticated,
  });

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

  // Check authentication on mount
  useEffect(() => {
    if (window.MURRAY_AUTH && window.MURRAY_AUTH.isAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      if (window.MURRAY_AUTH) {
        const result = window.MURRAY_AUTH.login(loginData.username, loginData.password);
        if (result.success) {
          setIsAuthenticated(true);
        } else {
          alert("Invalid credentials. Please try again.");
        }
      } else {
        alert("Authentication system not loaded. Please refresh the page.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Custom Business Header */}
        <header className="bg-black text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
              {/* Logo */}
              <img 
                src={newLogoPath} 
                alt="Murray Moving Logo" 
                className="h-12 w-auto object-contain"
                style={{ 
                  maxWidth: '200px',
                  maxHeight: '48px'
                }}
              />
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center p-6 mt-20">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Lock className="w-6 h-6 text-gray-600" />
                <span>Business Portal Login</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    required
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                    placeholder="Enter password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main dashboard layout with sticky header
  return (
    <div className="min-h-screen bg-background">
      {/* Custom Business Header - Always stays at top */}
      <header className="bg-black text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src={newLogoPath} 
                alt="Murray Moving Logo" 
                className="h-10 w-auto object-contain"
                style={{ 
                  maxWidth: '180px',
                  maxHeight: '40px'
                }}
              />
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (window.MURRAY_AUTH) {
                  window.MURRAY_AUTH.logout();
                  setIsAuthenticated(false);
                }
              }}
              className="bg-white text-black hover:bg-gray-100"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        
        {/* Navigation Tabs - Always visible */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto p-1">
            <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-2 py-2">Dashboard</TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs sm:text-sm px-2 py-2">Jobs</TabsTrigger>
            <TabsTrigger value="customers" className="text-xs sm:text-sm px-2 py-2">Customers</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">Analytics</TabsTrigger>
            <TabsTrigger value="exports" className="text-xs sm:text-sm px-2 py-2">Exports</TabsTrigger>
            <TabsTrigger value="customize" className="text-xs sm:text-sm px-2 py-2">Customize</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab Content */}
          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Business Dashboard</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">Job pipeline & analytics</p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-muted-foreground">Updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-green-600 truncate">Monthly Revenue</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-800 truncate">
                        ${financialsLoading ? '...' : (financials as any)?.monthlyRevenue || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-blue-600 truncate">Active Jobs</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-800 truncate">
                        {statsLoading ? '...' : (dashboardStats as any)?.activeJobs || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-purple-600 truncate">This Month</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-800 truncate">
                        {statsLoading ? '...' : (dashboardStats as any)?.monthlyJobs || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-orange-600 truncate">Total Customers</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-800 truncate">
                        {statsLoading ? '...' : (dashboardStats as any)?.totalCustomers || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Jobs */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Recent Jobs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!recentJobs || (recentJobs as any[])?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm sm:text-base">No jobs yet. Create your first job to get started!</p>
                    <Button 
                      onClick={() => setActiveTab("jobs")} 
                      className="mt-4"
                    >
                      Create First Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(recentJobs as any[])?.slice(0, 5).map((job: any) => (
                      <div key={job.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          {getStatusIcon(job.status)}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{job.customerName}</p>
                            <p className="text-xs text-gray-500 truncate">{job.serviceType} - {job.moveDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`text-xs ${getStatusColor(job.status)}`}>
                            {job.status}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">${job.estimate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setActiveTab("jobs")}
                    className="h-12 text-left justify-start"
                    variant="outline"
                  >
                    <Briefcase className="w-5 h-5 mr-2" />
                    Create New Job
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("customers")}
                    className="h-12 text-left justify-start"
                    variant="outline"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab Content */}
          <TabsContent value="jobs">
            <EnhancedJobManagement onBack={() => setActiveTab("dashboard")} />
          </TabsContent>

          {/* Customers Tab Content */}
          <TabsContent value="customers">
            <CustomerManagement onBack={() => setActiveTab("dashboard")} />
          </TabsContent>

          {/* Analytics Tab Content */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Monthly Financials</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      ${financialsLoading ? '...' : (financials as any)?.monthlyRevenue || 0}
                    </p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      ${financialsLoading ? '...' : (financials as any)?.monthlyExpenses || 0}
                    </p>
                    <p className="text-sm text-gray-600">Expenses</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      ${financialsLoading ? '...' : (((financials as any)?.monthlyRevenue || 0) - ((financials as any)?.monthlyExpenses || 0))}
                    </p>
                    <p className="text-sm text-gray-600">Profit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exports Tab Content */}
          <TabsContent value="exports">
            <ExportManager />
          </TabsContent>

          {/* Customize Tab Content */}
          <TabsContent value="customize">
            <CustomizableDashboard 
              isAuthenticated={isAuthenticated}
              onTabChange={setActiveTab}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}