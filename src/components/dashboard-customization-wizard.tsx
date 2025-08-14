import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Layout, Eye, Palette, BarChart3, Users, DollarSign, 
  Calendar, Clock, Briefcase, TrendingUp, MapPin, Phone, 
  Grid, LayoutGrid, Columns, Rows, Monitor, Smartphone, Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  }
};

interface DashboardCustomizationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: DashboardConfig) => void;
  currentConfig?: DashboardConfig;
}

export function DashboardCustomizationWizard({ 
  isOpen, 
  onClose, 
  onSave, 
  currentConfig = defaultConfig 
}: DashboardCustomizationWizardProps) {
  const [config, setConfig] = useState<DashboardConfig>(currentConfig);
  const [activeTab, setActiveTab] = useState("layout");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    onSave(config);
    localStorage.setItem('murrayDashboardConfig', JSON.stringify(config));
    
    // Apply theme change immediately
    if (config.theme === 'light') {
      setTheme('light');
    } else if (config.theme === 'dark') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
    
    toast({
      title: "Dashboard Customized",
      description: "Your dashboard preferences have been saved successfully.",
    });
    onClose();
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    toast({
      title: "Settings Reset",
      description: "Dashboard settings have been reset to defaults.",
    });
  };

  const updateWidget = (widgetKey: keyof DashboardConfig['widgets'], updates: Partial<DashboardConfig['widgets'][keyof DashboardConfig['widgets']]>) => {
    setConfig(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetKey]: { ...prev.widgets[widgetKey], ...updates }
      }
    }));
  };

  const widgetOptions = [
    { key: 'totalJobs', name: 'Total Jobs', icon: Briefcase, description: 'All-time job count' },
    { key: 'activeJobs', name: 'Active Jobs', icon: Clock, description: 'Currently in progress' },
    { key: 'revenue', name: 'Monthly Revenue', icon: DollarSign, description: 'Current month earnings' },
    { key: 'completedJobs', name: 'Completed This Month', icon: Calendar, description: 'Jobs finished this month' },
    { key: 'recentJobs', name: 'Recent Jobs', icon: BarChart3, description: 'Latest job activity' },
    { key: 'quickActions', name: 'Quick Actions', icon: Grid, description: 'Fast access buttons' },
    { key: 'financialOverview', name: 'Financial Overview', icon: TrendingUp, description: 'Revenue and profit summary' },
    { key: 'jobPipeline', name: 'Job Pipeline', icon: Users, description: 'Job status pipeline' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Dashboard Customization Wizard
          </DialogTitle>
          <DialogDescription>
            Personalize your Murray Moving dashboard to match your workflow and preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Dashboard Layout
                </CardTitle>
                <CardDescription>
                  Choose how your dashboard widgets are arranged
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer border-2 transition-all ${config.layout === 'grid' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border hover:border-green-300'}`}
                    onClick={() => setConfig(prev => ({ ...prev, layout: 'grid' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <LayoutGrid className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-medium">Grid Layout</h4>
                      <p className="text-xs text-muted-foreground">Balanced grid view</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer border-2 transition-all ${config.layout === 'columns' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border hover:border-green-300'}`}
                    onClick={() => setConfig(prev => ({ ...prev, layout: 'columns' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <Columns className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-medium">Column Layout</h4>
                      <p className="text-xs text-muted-foreground">Vertical columns</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer border-2 transition-all ${config.layout === 'compact' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border hover:border-green-300'}`}
                    onClick={() => setConfig(prev => ({ ...prev, layout: 'compact' }))}
                  >
                    <CardContent className="p-4 text-center">
                      <Rows className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-medium">Compact Layout</h4>
                      <p className="text-xs text-muted-foreground">Space-efficient</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Auto-refresh Interval (seconds)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>How often the dashboard automatically updates with new data</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="px-3">
                    <Slider
                      value={[config.refreshInterval]}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, refreshInterval: value[0] }))}
                      max={300}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>10s (Real-time)</span>
                      <span className="font-medium">{config.refreshInterval}s</span>
                      <span>300s (5 min)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="widgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  Widget Configuration
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Control which widgets appear on your dashboard and their display size</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  Enable, disable, and configure your dashboard widgets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {widgetOptions.map((widget) => {
                    const Icon = widget.icon;
                    const widgetConfig = config.widgets[widget.key as keyof typeof config.widgets];
                    
                    return (
                      <div key={widget.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <div>
                            <h4 className="font-medium">{widget.name}</h4>
                            <p className="text-sm text-gray-600">{widget.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`${widget.key}-enabled`} className="text-sm">Enabled</Label>
                            <Switch
                              id={`${widget.key}-enabled`}
                              checked={widgetConfig?.enabled || false}
                              onCheckedChange={(enabled) => updateWidget(widget.key as keyof DashboardConfig['widgets'], { enabled })}
                            />
                          </div>
                          
                          {widgetConfig?.enabled && (
                            <div className="flex items-center gap-2">
                              <Select
                                value={widgetConfig?.size || 'medium'}
                                onValueChange={(size: 'small' | 'medium' | 'large') => 
                                  updateWidget(widget.key as keyof DashboardConfig['widgets'], { size })
                                }
                              >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                              </SelectContent>
                            </Select>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="text-sm">
                                    <p><strong>Small:</strong> 1 column width (compact)</p>
                                    <p><strong>Medium:</strong> 2 columns width (standard)</p>
                                    <p><strong>Large:</strong> 3+ columns width (expanded)</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Theme & Appearance
                </CardTitle>
                <CardDescription>
                  Customize the visual appearance of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Card 
                      className={`cursor-pointer border-2 transition-all ${config.theme === 'light' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border hover:border-green-300'}`}
                      onClick={() => {
                        setConfig(prev => ({ ...prev, theme: 'light' }));
                        setTheme('light');
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 bg-white border rounded mx-auto mb-2 shadow-sm"></div>
                        <span className="text-sm font-medium">Light</span>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer border-2 transition-all ${config.theme === 'dark' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border hover:border-green-300'}`}
                      onClick={() => {
                        setConfig(prev => ({ ...prev, theme: 'dark' }));
                        setTheme('dark');
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 bg-gray-900 border rounded mx-auto mb-2 shadow-sm"></div>
                        <span className="text-sm font-medium">Dark</span>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer border-2 transition-all ${config.theme === 'auto' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border hover:border-green-300'}`}
                      onClick={() => {
                        setConfig(prev => ({ ...prev, theme: 'auto' }));
                        setTheme('system');
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-900 border rounded mx-auto mb-2 shadow-sm"></div>
                        <span className="text-sm font-medium">Auto</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure when and how you receive business updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">New Job Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified when new jobs are created</p>
                    </div>
                    <Switch
                      checked={config.notifications.newJobs}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, newJobs: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Job Status Updates</h4>
                      <p className="text-sm text-gray-600">Alerts when job status changes</p>
                    </div>
                    <Switch
                      checked={config.notifications.jobUpdates}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, jobUpdates: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Payment Reminders</h4>
                      <p className="text-sm text-gray-600">Reminders for overdue payments</p>
                    </div>
                    <Switch
                      checked={config.notifications.payments}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, payments: checked }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Daily Summary</h4>
                      <p className="text-sm text-gray-600">End-of-day business summary</p>
                    </div>
                    <Switch
                      checked={config.notifications.dailySummary}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, dailySummary: checked }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Preferences
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { type DashboardConfig, defaultConfig };