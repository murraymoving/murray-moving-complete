import { customers, jobs, quotes, contacts, type Customer, type Job, type Quote, type Contact, type InsertCustomer, type InsertJob, type InsertQuote, type InsertContact } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  addCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Job operations
  getJobs(): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  addJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, updates: Partial<InsertJob>): Promise<Job | undefined>;
  deleteJob(id: number): Promise<boolean>;

  // Quote operations (legacy)
  createQuote(quote: InsertQuote): Promise<Quote>;
  getQuotes(): Promise<Quote[]>;

  // Contact operations (legacy)
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;

  // Dashboard operations
  getDashboardStats(): Promise<any>;
  getFinancials(): Promise<any>;

  // Data management
  initializeSampleData(): Promise<void>;
  exportData(): Promise<any>;
  importData(data: { customers: Customer[], jobs: Job[] }): Promise<void>;
  clearAllData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async addCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db
      .insert(customers)
      .values({
        ...customer,
        updatedAt: new Date(),
      })
      .returning();
    return newCustomer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteCustomer(id: number): Promise<boolean> {
    // First check if customer has jobs
    const customerJobs = await db.select().from(jobs).where(eq(jobs.customerId, id));
    if (customerJobs.length > 0) {
      throw new Error("Cannot delete customer with existing jobs");
    }

    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount > 0;
  }

  // Job operations
  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job || undefined;
  }

  async addJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values({
        ...job,
        updatedAt: new Date(),
      })
      .returning();
    return newJob;
  }

  async updateJob(id: number, updates: Partial<InsertJob>): Promise<Job | undefined> {
    const [updated] = await db
      .update(jobs)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteJob(id: number): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return result.rowCount > 0;
  }

  // Dashboard operations
  async getDashboardStats(): Promise<any> {
    const allJobs = await this.getJobs();
    const allCustomers = await this.getCustomers();
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyJobs = allJobs.filter(job => 
      new Date(job.createdAt) >= thisMonth
    );
    
    const completedJobs = allJobs.filter(job => job.status === 'completed');
    const paidJobs = allJobs.filter(job => job.status === 'paid');
    const activeJobs = allJobs.filter(job => job.status === 'active');
    const bookedJobs = allJobs.filter(job => job.status === 'booked');
    const estimateJobs = allJobs.filter(job => job.status === 'estimate');
    
    // Actual revenue from completed and paid jobs
    const actualRevenue = [...completedJobs, ...paidJobs].reduce((sum, job) => sum + parseFloat(job.totalCost?.toString() || '0'), 0);
    
    // Potential revenue from booked and estimate jobs
    const potentialRevenue = [...bookedJobs, ...estimateJobs].reduce((sum, job) => sum + parseFloat(job.totalCost?.toString() || '0'), 0);
    
    // Monthly revenue calculations
    const monthlyCompleted = monthlyJobs.filter(job => job.status === 'completed' || job.status === 'paid');
    const monthlyRevenue = monthlyCompleted.reduce((sum, job) => sum + parseFloat(job.totalCost?.toString() || '0'), 0);
    
    const monthlyPotential = monthlyJobs.filter(job => job.status === 'booked' || job.status === 'estimate').reduce((sum, job) => sum + parseFloat(job.totalCost?.toString() || '0'), 0);

    return {
      totalCustomers: allCustomers.length,
      totalJobs: allJobs.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length + paidJobs.length,
      bookedJobs: bookedJobs.length,
      estimateJobs: estimateJobs.length,
      monthlyJobs: monthlyJobs.length,
      actualRevenue,
      potentialRevenue,
      totalRevenue: actualRevenue + potentialRevenue,
      monthlyRevenue,
      monthlyPotentialRevenue: monthlyPotential,
      averageJobValue: (completedJobs.length + paidJobs.length) > 0 ? actualRevenue / (completedJobs.length + paidJobs.length) : 0,
    };
  }

  async getFinancials(): Promise<any> {
    const allJobs = await this.getJobs();
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Monthly data for current year
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);
      
      const monthJobs = allJobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= monthStart && jobDate <= monthEnd && job.status === 'completed';
      });
      
      const revenue = monthJobs.reduce((sum, job) => sum + parseFloat(job.totalCost?.toString() || '0'), 0);
      const expenses = monthJobs.reduce((sum, job) => sum + parseFloat(job.materialsCost?.toString() || '0'), 0);
      
      monthlyData.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue,
        expenses,
        profit: revenue - expenses,
        jobs: monthJobs.length,
      });
    }
    
    return { monthlyData };
  }

  // Data management
  async initializeSampleData(): Promise<void> {
    // Check if data already exists
    const existingCustomers = await this.getCustomers();
    if (existingCustomers.length > 0) {
      return; // Data already exists
    }

    // Add sample customers
    const sampleCustomers = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '(609) 555-0123',
        address: '123 Main St',
        city: 'Chesterfield',
        state: 'NJ',
        zip: '08515',
        referralSource: 'Google Search',
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@email.com',
        phone: '(609) 555-0456',
        address: '456 Oak Ave',
        city: 'Princeton',
        state: 'NJ',
        zip: '08540',
        referralSource: 'Referral',
      },
      {
        firstName: 'Mike',
        lastName: 'Davis',
        email: 'mike.davis@email.com',
        phone: '(609) 555-0789',
        address: '789 Pine St',
        city: 'Trenton',
        state: 'NJ',
        zip: '08608',
        referralSource: 'Website',
      },
    ];

    const createdCustomers = [];
    for (const customer of sampleCustomers) {
      const created = await this.addCustomer(customer);
      createdCustomers.push(created);
    }

    // Add sample jobs
    const sampleJobs = [
      {
        customerId: createdCustomers[0]?.id || 1,
        title: 'Residential Move - 3BR House',
        status: 'completed' as const,
        originAddress: '123 Main St',
        originCity: 'Chesterfield',
        originState: 'NJ',
        originZip: '08515',
        destinationAddress: '456 Elm St',
        destinationCity: 'Princeton',
        destinationState: 'NJ',
        destinationZip: '08540',
        crewSize: 3,
        estimatedHours: '6.00',
        actualHours: '5.50',
        hourlyRate: '199.00',
        totalCost: '1094.50',
        paymentStatus: 'paid',
        jobType: 'residential',
        vehicleType: 'truck',
      },
      {
        customerId: createdCustomers[1]?.id || 2,
        title: 'Apartment Move - 2BR',
        status: 'booked' as const,
        originAddress: '456 Oak Ave',
        originCity: 'Princeton',
        originState: 'NJ',
        originZip: '08540',
        destinationAddress: '789 Cedar Ln',
        destinationCity: 'Hamilton',
        destinationState: 'NJ',
        destinationZip: '08610',
        crewSize: 2,
        estimatedHours: '4.00',
        hourlyRate: '149.00',
        totalCost: '596.00',
        paymentStatus: 'pending',
        jobType: 'residential',
        vehicleType: 'van',
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        customerId: createdCustomers[2]?.id || 3,
        title: 'Office Relocation',
        status: 'estimate' as const,
        originAddress: '789 Pine St',
        originCity: 'Trenton',
        originState: 'NJ',
        originZip: '08608',
        destinationAddress: '321 Business Blvd',
        destinationCity: 'Lawrenceville',
        destinationState: 'NJ',
        destinationZip: '08648',
        crewSize: 4,
        estimatedHours: '8.00',
        hourlyRate: '249.00',
        totalCost: '1992.00',
        jobType: 'commercial',
        vehicleType: 'truck',
      },
    ];

    for (const job of sampleJobs) {
      await this.addJob(job);
    }
  }

  async exportData(): Promise<any> {
    const allCustomers = await this.getCustomers();
    const allJobs = await this.getJobs();
    
    return {
      customers: allCustomers,
      jobs: allJobs,
      exportDate: new Date().toISOString(),
    };
  }

  async importData(data: { customers: Customer[], jobs: Job[] }): Promise<void> {
    // Clear existing data
    await this.clearAllData();
    
    // Import customers
    for (const customer of data.customers) {
      const { id, createdAt, updatedAt, ...customerData } = customer;
      await this.addCustomer(customerData);
    }
    
    // Import jobs
    for (const job of data.jobs) {
      const { id, createdAt, updatedAt, ...jobData } = job;
      await this.addJob(jobData);
    }
  }

  async clearAllData(): Promise<void> {
    await db.delete(jobs); // Delete jobs first due to foreign key
    await db.delete(customers);
    await db.delete(quotes);
    await db.delete(contacts);
  }

  // Quote operations (legacy compatibility)
  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db
      .insert(quotes)
      .values(quote)
      .returning();
    return newQuote;
  }

  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  // Contact operations (legacy compatibility)
  async createContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }
}

export const storage = new DatabaseStorage();