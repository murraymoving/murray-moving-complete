import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, FileText, Database, Archive, Trash2 } from "lucide-react";
import { clientStorage } from "@/lib/clientStorage";

export function ExportManagerClient() {
  const [importData, setImportData] = useState("");
  const [exportFormat, setExportFormat] = useState("json");

  const handleExportJSON = () => {
    const data = clientStorage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    downloadFile(blob, `murray-moving-data-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleExportCSV = () => {
    const customers = clientStorage.getCustomers();
    const jobs = clientStorage.getJobs();

    // Create CSV for customers
    const customerHeaders = [
      'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Address', 'City', 'State', 'ZIP',
      'Referral Source', 'Preferred Contact', 'Notes', 'Created At'
    ];
    
    const customerRows = customers.map(customer => [
      customer.id,
      customer.firstName,
      customer.lastName,
      customer.email || '',
      customer.phone,
      customer.address || '',
      customer.city || '',
      customer.state || '',
      customer.zip || '',
      customer.referralSource || '',
      customer.preferredContact || '',
      customer.notes || '',
      customer.createdAt
    ]);

    const customerCSV = [customerHeaders, ...customerRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create CSV for jobs
    const jobHeaders = [
      'ID', 'Customer ID', 'Title', 'Status', 'Origin Address', 'Origin City', 'Origin State', 'Origin ZIP',
      'Destination Address', 'Destination City', 'Destination State', 'Destination ZIP',
      'Preferred Date', 'Crew Size', 'Estimated Hours', 'Hourly Rate', 'Total Cost',
      'Job Type', 'Vehicle Type', 'Notes', 'Created At'
    ];
    
    const jobRows = jobs.map(job => [
      job.id,
      job.customerId,
      job.title,
      job.status,
      job.originAddress,
      job.originCity,
      job.originState,
      job.originZip,
      job.destinationAddress,
      job.destinationCity,
      job.destinationState,
      job.destinationZip,
      job.preferredDate || '',
      job.crewSize || '',
      job.estimatedHours || '',
      job.hourlyRate || '',
      job.totalCost || '',
      job.jobType || '',
      job.vehicleType || '',
      job.notes || '',
      job.createdAt
    ]);

    const jobCSV = [jobHeaders, ...jobRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create combined CSV file
    const combinedCSV = `CUSTOMERS\n${customerCSV}\n\nJOBS\n${jobCSV}`;
    const blob = new Blob([combinedCSV], { type: 'text/csv' });
    downloadFile(blob, `murray-moving-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportReport = () => {
    const stats = clientStorage.getDashboardStats();
    const customers = clientStorage.getCustomers();
    const jobs = clientStorage.getJobs();

    const report = `
MURRAY MOVING - BUSINESS REPORT
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
==================
Total Customers: ${stats.totalCustomers}
Total Jobs: ${stats.totalJobs}
Active Jobs: ${stats.activeJobs}
Completed Jobs: ${stats.completedJobs}
Total Revenue: $${stats.totalRevenue.toLocaleString()}
Monthly Revenue: $${stats.monthlyRevenue.toLocaleString()}
Average Job Value: $${stats.averageJobValue.toFixed(2)}

RECENT CUSTOMERS
================
${customers.slice(-10).map(c => 
  `${c.firstName} ${c.lastName} - ${c.phone} - ${c.email || 'No email'} - Added: ${new Date(c.createdAt).toLocaleDateString()}`
).join('\n')}

RECENT JOBS
===========
${jobs.slice(-10).map(j => 
  `#${j.id} - ${j.title} - ${j.status.toUpperCase()} - ${j.originCity}, ${j.originState} → ${j.destinationCity}, ${j.destinationState} - $${j.totalCost || 0}`
).join('\n')}

JOB STATUS BREAKDOWN
====================
${Object.entries(
  jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([status, count]) => `${status.toUpperCase()}: ${count}`).join('\n')}

REVENUE BY MONTH
================
${clientStorage.getFinancials().monthlyData.map(month => 
  `${month.month}: $${month.revenue.toLocaleString()} (${month.jobs} jobs)`
).join('\n')}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    downloadFile(blob, `murray-moving-report-${new Date().toISOString().split('T')[0]}.txt`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      
      if (!data.customers || !data.jobs) {
        alert('Invalid data format. Expected JSON with customers and jobs arrays.');
        return;
      }

      if (confirm('This will replace all existing data. Are you sure you want to proceed?')) {
        clientStorage.importData(data);
        alert('Data imported successfully!');
        setImportData("");
        window.location.reload(); // Refresh to show new data
      }
    } catch (error) {
      alert('Invalid JSON format. Please check your data and try again.');
    }
  };

  const handleClearAllData = () => {
    const confirmText = "DELETE ALL DATA";
    const userInput = prompt(
      `This will permanently delete ALL customers, jobs, and data. This cannot be undone.\n\nType "${confirmText}" to confirm:`
    );
    
    if (userInput === confirmText) {
      clientStorage.clearAllData();
      alert('All data has been cleared.');
      window.location.reload();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setImportData(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Data Export & Management</h1>
        <p className="text-muted-foreground mt-2">
          Export your business data for backups or external analysis
        </p>
      </div>

      {/* Export Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              JSON Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Complete data backup in JSON format. Best for importing back into the system.
            </p>
            <Button onClick={handleExportJSON} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              CSV Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Spreadsheet-friendly format. Great for analysis in Excel or Google Sheets.
            </p>
            <Button onClick={handleExportCSV} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Archive className="w-5 h-5 mr-2" />
              Business Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive business summary with statistics and recent activity.
            </p>
            <Button onClick={handleExportReport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Upload JSON File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="import-data">Or Paste JSON Data</Label>
            <Textarea
              id="import-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste your JSON data here..."
              rows={8}
              className="mt-1 font-mono text-sm"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              onClick={handleImport} 
              disabled={!importData.trim()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setImportData("")}
              disabled={!importData.trim()}
            >
              Clear
            </Button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> Importing will replace all existing data. Make sure to export a backup first.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <Trash2 className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete all data including customers, jobs, and settings. This action cannot be undone.
          </p>
          <Button 
            variant="destructive" 
            onClick={handleClearAllData}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </CardContent>
      </Card>

      {/* Current Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {clientStorage.getCustomers().length}
              </p>
              <p className="text-sm text-muted-foreground">Customers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {clientStorage.getJobs().length}
              </p>
              <p className="text-sm text-muted-foreground">Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {(JSON.stringify(clientStorage.exportData()).length / 1024).toFixed(1)} KB
              </p>
              <p className="text-sm text-muted-foreground">Data Size</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}