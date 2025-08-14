import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, Users, Briefcase, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ExportManager() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const handleExport = async (type: string, endpoint: string, filename: string) => {
    setIsExporting(type);
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `${filename} has been downloaded successfully.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    {
      id: 'complete-report',
      title: 'Complete Business Report',
      description: 'All jobs, customers, and business analytics in one Excel file',
      icon: Briefcase,
      endpoint: '/api/export/jobs/excel',
      filename: `murray-moving-complete-report-${new Date().toISOString().split('T')[0]}.xlsx`,
      color: 'bg-blue-500',
    },
    {
      id: 'customer-list',
      title: 'Customer Database',
      description: 'Complete customer contact list with job history and revenue',
      icon: Users,
      endpoint: '/api/export/customers/excel',
      filename: `murray-moving-customers-${new Date().toISOString().split('T')[0]}.xlsx`,
      color: 'bg-green-500',
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Export Manager</h2>
        <p className="text-gray-600 mt-2">
          Download Excel spreadsheets to track your business data offline or share with your accountant.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isLoading = isExporting === option.id;
          
          return (
            <Card key={option.id} className="border-2 hover:border-gray-300 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${option.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleExport(option.id, option.endpoint, option.filename)}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Excel File
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            What's Included in Your Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Complete Business Report Includes:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• All job details with customer information</li>
              <li>• Pricing breakdown and revenue tracking</li>
              <li>• Job status pipeline (Lead → Estimate → Booked → Active → Completed → Paid)</li>
              <li>• Service type tracking (Odd Jobs, Labor Only, Weekend/Holiday rates)</li>
              <li>• Customer contact details and special instructions</li>
              <li>• Business summary with total revenue and job statistics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Customer Database Includes:</h4>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Complete contact information for all customers</li>
              <li>• Job history and total revenue per customer</li>
              <li>• Special instructions and notes</li>
              <li>• Customer creation dates for tracking growth</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Pro Tip:</strong> These Excel files are perfect for sharing with your accountant, 
              tracking monthly performance, or importing into other business software. All data is 
              formatted and ready for analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}