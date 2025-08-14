import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, BarChart3, Users, DollarSign, 
  Calendar, Clock, Briefcase, TrendingUp, MapPin, Phone
} from "lucide-react";
import { DashboardCustomizationWizard } from "./dashboard-customization-wizard";

interface DashboardConfig {
  layout: 'grid' | 'columns' | 'compact';
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number;
  widgets: {
    totalJobs: { enabled: boolean; size: 'small' | 'medium' | 'large'; position: number };
    activeJobs: { enabled: boolean; size: 'small' | 'medium' | 'large'; position: number };
    completedJobs: { enabled: boolean; size: 'small' | 'medium' | 'large'; position: number };
    revenue: { enabled: boolean; size: 'small' | 'medium' | 'large'; position: number };
    recentJobs: { enabled: boolean; size: 'small' | 'medium' | 'large'; position: number };
    quickActions: { enabled: boolean; size: 'small' | 'medium' | 'large'; position: number };
    financialOverview: { enabled: boolean; size: 'small' | 'medium' | 'large'; position: number };
    jobPipeline: { enabled: boolean; size: 'small' | 'medium' | 'large'; position: number };
  };
  notifications: {
    newJobs: boolean;
    jobUpdates: boolean;
    payments: boolean;
    dailySummary: boolean;
  };
}

const defaultConfig: DashboardConfig = {
  layout: 'grid',
  theme: 'light',
  refreshInterval: 30,
  widgets: {
    totalJobs: { enabled: true, size: 'small', position: 1 },
    activeJobs: { enabled: true, size: 'small', position: 2 },
    completedJobs: { enabled: true, size: 'small', position: 3 },
    revenue: { enabled: true, size: 'small', position: 4 },
    recentJobs: { enabled: true, size: 'large', position: 5 },
    quickActions: { enabled: true, size: 'medium', position: 6 },
    financialOverview: { enabled: true, size: 'medium', position: 7 },
    jobPipeline: { enabled: true, size: 'large', position: 8 },
  },
  notifications: {
    newJobs: true,
    jobUpdates: true,
    payments: true,
    dailySummary: false,
  },
};

interface CustomizableDashboardProps {
  isAuthenticated: boolean;
  onTabChange: (tab: string) => void;
}

export function CustomizableDashboard({ isAuthenticated, onTabChange }: CustomizableDashboardProps) {
  const [, setLocation] = useLocation();
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>(defaultConfig);
  const [showCustomizationWizard, setShowCustomizationWizard] = useState(false);

  // Load saved configuration
  useEffect(() => {
    const saved = localStorage.getItem('murrayDashboardConfig');
    if (saved) {
      try {
        setDashboardConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load dashboard config:', e);
      }
    }
  }, []);

  // Fetch data with auto-refresh
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    refetchInterval: dashboardConfig.refreshInterval * 1000,
    enabled: isAuthenticated,
  });

  const { data: financials, isLoading: financialsLoading } = useQuery({
    queryKey: ['/api/dashboard/financials'],
    refetchInterval: dashboardConfig.refreshInterval * 1000,
    enabled: isAuthenticated,
  });

  const { data: recentJobs } = useQuery({
    queryKey: ['/api/jobs'],
    refetchInterval: dashboardConfig.refreshInterval * 1000,
    enabled: isAuthenticated,
  });

  const getStatusColor = (status: string) => {
    const colors = {
      lead: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      estimate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      booked: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      active: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  const renderWidget = (widgetKey: keyof DashboardConfig['widgets'], content: React.ReactNode) => {
    const widget = dashboardConfig.widgets[widgetKey];
    if (!widget || !widget.enabled) return null;

    const sizeClasses = {
      small: "col-span-1",
      medium: "col-span-1 sm:col-span-2",
      large: "col-span-1 sm:col-span-2 lg:col-span-3"
    };

    return (
      <div key={widgetKey} className={sizeClasses[widget.size]} style={{ order: widget.position }}>
        {content}
      </div>
    );
  };

  const layoutClasses = {
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6",
    columns: "grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6",
    compact: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Customization Button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Murray Moving Business Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Job pipeline & business analytics
            {dashboardConfig.refreshInterval < 60 && (
              <span className="ml-2 text-green-600 font-medium text-xs sm:text-sm">• Live Updates</span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCustomizationWizard(true)}
            className="flex items-center gap-2 w-full sm:w-auto text-xs sm:text-sm"
            size="sm"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Customize Dashboard</span>
            <span className="sm:hidden">Customize</span>
          </Button>
          <div className="text-center sm:text-right">
            <p className="text-xs sm:text-sm text-muted-foreground">Updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* Customizable Widget Layout */}
      <div className={layoutClasses[dashboardConfig.layout]}>
        {renderWidget('totalJobs', (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("jobs")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : (dashboardStats as any)?.totalJobs || 0}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
              <p className="text-xs text-blue-600 mt-1">View all jobs</p>
            </CardContent>
          </Card>
        ))}

        {renderWidget('activeJobs', (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("jobs")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : (dashboardStats as any)?.activeJobs || 0}
              </div>
              <p className="text-xs text-muted-foreground">In progress</p>
              <p className="text-xs text-blue-600 mt-1">Manage active jobs</p>
            </CardContent>
          </Card>
        ))}

        {renderWidget('completedJobs', (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("jobs")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : (dashboardStats as any)?.completedThisMonth || 0}
              </div>
              <p className="text-xs text-muted-foreground">Current month</p>
              <p className="text-xs text-blue-600 mt-1">View completed jobs</p>
            </CardContent>
          </Card>
        ))}

        {renderWidget('revenue', (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("financials")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financialsLoading ? "..." : (financials as any)?.revenue?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Profit: ${financialsLoading ? "..." : (financials as any)?.profit?.toLocaleString() || 0}
              </p>
              <p className="text-xs text-blue-600 mt-1">Click for detailed breakdown</p>
            </CardContent>
          </Card>
        ))}

        {renderWidget('recentJobs', (
          <Card className="col-span-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <CardTitle className="text-lg sm:text-xl">Recent Jobs</CardTitle>
                <p className="text-sm text-muted-foreground">Latest job activity</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => onTabChange("jobs")}
                className="w-full sm:w-auto shrink-0"
                size="sm"
              >
                <span className="sm:hidden">All Jobs</span>
                <span className="hidden sm:inline">Manage All Jobs</span>
              </Button>
            </CardHeader>
            <CardContent>
              {!recentJobs || (recentJobs as any[]).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No jobs yet. Create your first job to get started!</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => onTabChange("jobs")}
                  >
                    Create First Job
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(recentJobs as any[]).slice(0, 5).map((job: any) => (
                    <div 
                      key={job.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow space-y-2 sm:space-y-0"
                      onClick={() => {
                        // Navigate to jobs tab and highlight this specific job
                        onTabChange("jobs");
                        // Store the job ID for highlighting in jobs tab
                        localStorage.setItem('highlightJobId', job.id.toString());
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(job.status)} >
                            <span className="text-xs">{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm sm:text-base">{job.title}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-0 sm:space-x-4">
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{job.originCity}, {job.originState}</span>
                            </span>
                            <span className="hidden sm:inline">→</span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{job.destinationCity}, {job.destinationState}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:text-right">
                        <p className="font-medium text-green-600 text-sm sm:text-base">
                          ${Number(job.totalEstimate || 0).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {renderWidget('quickActions', (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => onTabChange("jobs")}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Create New Job
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => onTabChange("customers")}
              >
                <Users className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </CardContent>
          </Card>
        ))}

        {renderWidget('financialOverview', (
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onTabChange("financials")}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Monthly Financials</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-medium text-green-600">
                    ${(financials as any)?.revenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expenses:</span>
                  <span className="font-medium text-red-600">
                    ${(financials as any)?.expenses?.toLocaleString() || 0}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="font-medium">Net Profit:</span>
                  <span className={`font-bold ${((financials as any)?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(financials as any)?.profit?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {renderWidget('jobPipeline', (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Job Pipeline Overview</CardTitle>
              <p className="text-sm text-muted-foreground">Jobs by status across the pipeline</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {['lead', 'estimate', 'booked', 'active', 'completed', 'paid', 'canceled'].map((status) => {
                  const count = recentJobs ? 
                    (recentJobs as any[]).filter(job => job.status === status).length : 0;
                  return (
                    <div key={status} className="text-center p-3 border rounded-lg">
                      <div className="text-xl font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground capitalize">{status}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customization Wizard */}
      <DashboardCustomizationWizard
        isOpen={showCustomizationWizard}
        onClose={() => setShowCustomizationWizard(false)}
        onSave={(config: any) => setDashboardConfig(config)}
        currentConfig={dashboardConfig as any}
      />
    </div>
  );
}