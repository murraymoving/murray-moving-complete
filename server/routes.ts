import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuoteSchema, insertContactSchema, insertJobSchema, insertCustomerSchema,
  type Job, type Customer 
} from "@shared/schema";
import { z } from "zod";
import * as XLSX from 'xlsx';
import { MurrayTariffCalculator } from "./calculations";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to convert validated numbers to strings for database
  const convertDecimalFields = (data: any) => {
    const converted = { ...data };
    const decimalFields = ['estimatedHours', 'actualHours', 'totalDistance', 'laborCost', 'travelFee', 'totalEstimate', 'totalActual', 'mileageFee', 'boxOverageFee', 'mattressBagFee', 'materialsCost'];
    
    decimalFields.forEach(field => {
      if (converted[field] !== undefined && converted[field] !== null) {
        converted[field] = String(converted[field]);
      }
    });
    
    return converted;
  };

  // Enhanced admin authentication middleware
  const adminAuth = (req: any, res: any, next: any) => {
    if ((req.session as any)?.isAdmin || (req.session as any)?.isAuthenticated) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Authentication routes
  app.get('/api/auth/user', adminAuth, async (req: any, res) => {
    try {
      const user = {
        id: 'admin',
        email: 'admin@murraymoving.com',
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
      };
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Secure admin login endpoint with enhanced security
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Enhanced security credentials - much stronger than before
    const validCredentials = [
      { username: "Admin_mm", password: "Gnivom22Murray?" }
    ];
    
    const isValidUser = validCredentials.some(cred => 
      cred.username === username && cred.password === password
    );
    
    if (isValidUser) {
      (req.session as any).isAdmin = true;
      (req.session as any).isAuthenticated = true;
      (req.session as any).username = username;
      (req.session as any).loginTime = new Date().toISOString();
      res.json({ 
        success: true, 
        message: 'Logged in successfully',
        user: username 
      });
    } else {
      // Add delay to prevent brute force attacks
      setTimeout(() => {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }, 1000);
    }
  });

  // Admin logout endpoint
  app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

  // Legacy routes for website admin portal (keep existing functionality)
  app.get('/api/admin/quotes', adminAuth, async (req, res) => {
    try {
      const quotes = await storage.getAllQuotes();
      res.json({ success: true, quotes });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch quotes" 
      });
    }
  });

  app.get('/api/admin/contacts', adminAuth, async (req, res) => {
    try {
      const contacts = await storage.getAllContacts();
      res.json({ success: true, contacts });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch contacts" 
      });
    }
  });

  // Quote Requests API (from website)
  app.post("/api/quotes", async (req, res) => {
    try {
      const quoteData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(quoteData);
      res.json({ success: true, quote });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Invalid quote data", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Failed to create quote request" 
        });
      }
    }
  });

  // Contact Form API (from website)
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Invalid contact data", 
          details: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: "Failed to create contact message" 
        });
      }
    }
  });

  // NEW BUSINESS MANAGEMENT API ROUTES
  
  // Initialize sample data if needed
  app.post("/api/admin/initialize", async (req, res) => {
    try {
      await storage.initializeSampleData();
      res.json({ success: true, message: "Sample data initialized" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Dashboard and Analytics (open for now)
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/dashboard/financials", async (req, res) => {
    try {
      const financials = await storage.getFinancials();
      res.json(financials);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Customer Management (open for now)
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const result = insertCustomerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid customer data", details: result.error });
      }

      const customer = await storage.addCustomer(result.data);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Job Management (open for now)
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const result = insertJobSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid job data", details: result.error });
      }

      const job = await storage.addJob(result.data);
      res.status(201).json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/customers/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertCustomerSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid customer data", details: result.error });
      }

      const customer = await storage.updateCustomer(id, result.data);
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Job Management - Core Pipeline
  app.get("/api/jobs", adminAuth, async (req, res) => {
    try {
      const { status, customer } = req.query;
      let jobs;
      
      if (status) {
        jobs = await storage.getJobsByStatus(status as string);
      } else if (customer) {
        jobs = await storage.getJobsByCustomer(parseInt(customer as string));
      } else {
        jobs = await storage.getAllJobs();
      }
      
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs", adminAuth, async (req, res) => {
    try {
      const result = insertJobSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid job data", details: result.error });
      }

      // Auto-calculate pricing using Murray's official tariff
      let finalJobData = { ...result.data };
      
      if (finalJobData.estimatedHours && finalJobData.crewSize && finalJobData.totalDistance) {
        const estimate = MurrayTariffCalculator.calculateJobEstimate({
          crewSize: finalJobData.crewSize,
          estimatedHours: finalJobData.estimatedHours,
          distanceMiles: finalJobData.totalDistance,
          boxCountQuoted: finalJobData.boxCountQuoted || 0,
          mattressBagCount: finalJobData.mattressBagCount || 0,
          materialsCost: finalJobData.materialsCost ? Number(finalJobData.materialsCost) : 0,
          isOddJob: finalJobData.isOddJob || false,
          isLaborOnly: finalJobData.isLaborOnly || false,
          preferredDate: finalJobData.preferredDate || undefined,
          isWeekend: finalJobData.isWeekend || false,
          isHoliday: finalJobData.isHoliday || false,
        });

        // Update job data with calculated pricing
        finalJobData.laborCost = estimate.laborCost;
        finalJobData.travelFee = estimate.travelFee;
        finalJobData.mileageFee = estimate.mileageFee;
        finalJobData.mattressBagFee = estimate.mattressBagFee;
        finalJobData.materialsCost = estimate.materialsCost;
        finalJobData.totalEstimate = estimate.totalEstimate;
      }

      // Convert validated data for database storage
      const jobData = convertDecimalFields(finalJobData);
      const job = await storage.createJob(jobData as any);
      res.status(201).json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/jobs/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/jobs/:id", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertJobSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid job data", details: result.error });
      }

      // Convert validated data for database storage
      const updateData = convertDecimalFields(result.data);
      const job = await storage.updateJob(id, updateData as any);
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/jobs/:id/status", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!jobStatusEnum.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const job = await storage.updateJobStatus(id, status);
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Job profit analysis
  app.get("/api/jobs/:id/profit", adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profit = await storage.getJobProfitAnalysis(id);
      res.json(profit);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Calculate job pricing using Murray's official tariff
  app.post("/api/jobs/calculate-pricing", adminAuth, async (req, res) => {
    try {
      const {
        crewSize,
        estimatedHours,
        distanceMiles,
        boxCountQuoted = 0,
        mattressBagCount = 0,
        materialsCost = 0,
        isOddJob = false,
        isLaborOnly = false,
        preferredDate,
        isWeekend = false,
        isHoliday = false
      } = req.body;

      if (!crewSize || !estimatedHours || distanceMiles === undefined) {
        return res.status(400).json({ 
          error: "Missing required fields: crewSize, estimatedHours, distanceMiles" 
        });
      }

      const estimate = MurrayTariffCalculator.calculateJobEstimate({
        crewSize: Number(crewSize),
        estimatedHours: Number(estimatedHours),
        distanceMiles: Number(distanceMiles),
        boxCountQuoted: Number(boxCountQuoted),
        mattressBagCount: Number(mattressBagCount),
        materialsCost: Number(materialsCost),
        isOddJob,
        isLaborOnly,
        preferredDate,
        isWeekend,
        isHoliday,
      });

      res.json(estimate);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Crew Management
  app.get("/api/crew", adminAuth, async (req, res) => {
    try {
      const { active } = req.query;
      const crew = active === 'true' 
        ? await storage.getActiveCrewMembers()
        : await storage.getAllCrewMembers();
      res.json(crew);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crew", adminAuth, async (req, res) => {
    try {
      const result = insertCrewMemberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid crew member data", details: result.error });
      }

      const crew = await storage.createCrewMember(result.data);
      res.status(201).json(crew);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vehicle Management
  app.get("/api/vehicles", adminAuth, async (req, res) => {
    try {
      const { active } = req.query;
      const vehicles = active === 'true'
        ? await storage.getActiveVehicles()
        : await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vehicles", adminAuth, async (req, res) => {
    try {
      const result = insertVehicleSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid vehicle data", details: result.error });
      }

      const vehicle = await storage.createVehicle(result.data);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Expense Tracking
  app.get("/api/expenses", adminAuth, async (req, res) => {
    try {
      const { job } = req.query;
      const expenses = job
        ? await storage.getJobExpenses(parseInt(job as string))
        : await storage.getAllExpenses();
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/expenses", adminAuth, async (req, res) => {
    try {
      const result = insertExpenseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid expense data", details: result.error });
      }

      const expense = await storage.createExpense(result.data);
      res.status(201).json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Export routes for Excel/PDF reports
  app.get("/api/export/jobs/excel", adminAuth, async (req, res) => {
    try {
      const jobs = await storage.getAllJobs();
      const customers = await storage.getAllCustomers();
      
      // Create customer lookup for job data
      const customerMap = new Map(customers.map(c => [c.id, c]));
      
      // Prepare job data for Excel
      const jobData = jobs.map(job => {
        const customer = customerMap.get(job.customerId);
        return {
          'Job ID': job.id,
          'Customer': customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
          'Phone': customer?.phone || '',
          'Email': customer?.email || '',
          'Status': job.status,
          'Title': job.title,
          'Origin': `${job.originAddress}, ${job.originCity}, ${job.originState} ${job.originZip}`,
          'Destination': `${job.destinationAddress}, ${job.destinationCity}, ${job.destinationState} ${job.destinationZip}`,
          'Job Date': job.jobDate || job.preferredDate,
          'Time Window': job.timeWindow || `${job.preferredStartTime || ''} - ${job.preferredEndTime || ''}`,
          'Crew Size': job.crewSize,
          'Estimated Hours': job.estimatedHours,
          'Total Distance': job.totalDistance,
          'Labor Cost': job.laborCost,
          'Travel Fee': job.travelFee,
          'Total Estimate': job.totalEstimate,
          'Created': new Date(job.createdAt).toLocaleDateString(),
          'Special Instructions': job.internalNotes || job.customerNotes || '',
          'Is Odd Job': job.isOddJob ? 'Yes' : 'No',
          'Is Labor Only': job.isLaborOnly ? 'Yes' : 'No',
          'Is Weekend': job.isWeekend ? 'Yes' : 'No',
          'Is Holiday': job.isHoliday ? 'Yes' : 'No'
        };
      });

      // Create workbook with multiple sheets
      const workbook = XLSX.utils.book_new();
      
      // Jobs sheet
      const jobsSheet = XLSX.utils.json_to_sheet(jobData);
      XLSX.utils.book_append_sheet(workbook, jobsSheet, 'Jobs');
      
      // Customers sheet
      const customerData = customers.map(customer => ({
        'Customer ID': customer.id,
        'Name': `${customer.firstName} ${customer.lastName}`,
        'Phone': customer.phone,
        'Email': customer.email,
        'Address': customer.address || '',
        'City': customer.city || '',
        'State': customer.state || '',
        'Zip': customer.zip || '',
        'Special Instructions': customer.specialInstructions || '',
        'Created': new Date(customer.createdAt).toLocaleDateString()
      }));
      const customersSheet = XLSX.utils.json_to_sheet(customerData);
      XLSX.utils.book_append_sheet(workbook, customersSheet, 'Customers');
      
      // Summary sheet
      const totalRevenue = jobs.reduce((sum, job) => sum + Number(job.totalEstimate || 0), 0);
      const jobsByStatus = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const summaryData = [
        { 'Metric': 'Total Jobs', 'Value': jobs.length },
        { 'Metric': 'Total Revenue', 'Value': `$${totalRevenue.toFixed(2)}` },
        { 'Metric': 'Average Job Value', 'Value': jobs.length > 0 ? `$${(totalRevenue / jobs.length).toFixed(2)}` : '$0' },
        { 'Metric': '', 'Value': '' },
        { 'Metric': 'Jobs by Status:', 'Value': '' },
        ...Object.entries(jobsByStatus).map(([status, count]) => ({
          'Metric': `  ${status}`, 'Value': count
        }))
      ];
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Generate Excel file
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="murray-moving-report-${timestamp}.xlsx"`);
      res.send(buffer);
      
    } catch (error: any) {
      console.error('Export error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/export/customers/excel", adminAuth, async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
      const jobs = await storage.getAllJobs();
      
      // Get job counts and revenue per customer
      const customerJobStats = jobs.reduce((acc, job) => {
        if (!acc[job.customerId]) {
          acc[job.customerId] = { count: 0, revenue: 0 };
        }
        acc[job.customerId].count++;
        acc[job.customerId].revenue += Number(job.totalEstimate || 0);
        return acc;
      }, {} as Record<number, { count: number; revenue: number }>);
      
      const customerData = customers.map(customer => {
        const stats = customerJobStats[customer.id] || { count: 0, revenue: 0 };
        return {
          'Customer ID': customer.id,
          'First Name': customer.firstName,
          'Last Name': customer.lastName,
          'Phone': customer.phone,
          'Email': customer.email,
          'Address': customer.address || '',
          'City': customer.city || '',
          'State': customer.state || '',
          'Zip': customer.zip || '',
          'Total Jobs': stats.count,
          'Total Revenue': `$${stats.revenue.toFixed(2)}`,
          'Special Instructions': customer.specialInstructions || '',
          'Created Date': new Date(customer.createdAt).toLocaleDateString()
        };
      });

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(customerData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="murray-moving-customers-${timestamp}.xlsx"`);
      res.send(buffer);
      
    } catch (error: any) {
      console.error('Export error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}