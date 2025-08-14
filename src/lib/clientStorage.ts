// Client-side storage system for Murray Moving
// Replaces backend API calls with localStorage persistence

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  secondaryPhone?: string;
  preferredContact?: string;
  referralSource?: string;
  notes?: string;
  gateCodes?: string;
  specialInstructions?: string;
  claimsHistory?: boolean;
  preferredDays?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: number;
  customerId: number;
  status: 'lead' | 'estimate' | 'booked' | 'active' | 'completed' | 'paid';
  title: string;
  description?: string;
  jobNumber?: string;
  invoiceNumber?: string;
  originAddress: string;
  originCity: string;
  originState: string;
  originZip: string;
  originFloors?: number;
  originStairs?: boolean;
  originElevator?: boolean;
  originParkingNotes?: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  destinationFloors?: number;
  destinationStairs?: boolean;
  destinationElevator?: boolean;
  destinationParkingNotes?: string;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  boxCountQuoted?: number;
  boxCountActual?: number;
  crewSize?: number;
  estimatedHours?: number;
  actualHours?: number;
  hourlyRate?: number;
  totalDistance?: number;
  mileageRate?: number;
  materialsCost?: number;
  laborCost?: number;
  travelCost?: number;
  totalCost?: number;
  depositAmount?: number;
  balanceDue?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  jobType?: string;
  vehicleType?: string;
  seasonalMultiplier?: number;
  discountPercent?: number;
  taxRate?: number;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

class ClientStorage {
  private storage = window.localStorage;
  
  // Counters for auto-incrementing IDs
  private getNextId(type: 'customer' | 'job'): number {
    const key = `mm_${type}_counter`;
    const current = parseInt(this.storage.getItem(key) || '0');
    const next = current + 1;
    this.storage.setItem(key, next.toString());
    return next;
  }

  // Customer management
  getCustomers(): Customer[] {
    try {
      const data = this.storage.getItem('mm_customers');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCustomers(customers: Customer[]): void {
    this.storage.setItem('mm_customers', JSON.stringify(customers));
  }

  addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer {
    const customers = this.getCustomers();
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...customer,
      id: this.getNextId('customer'),
      createdAt: now,
      updatedAt: now,
    };
    
    customers.push(newCustomer);
    this.saveCustomers(customers);
    return newCustomer;
  }

  updateCustomer(id: number, updates: Partial<Customer>): Customer | null {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    customers[index] = {
      ...customers[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveCustomers(customers);
    return customers[index];
  }

  deleteCustomer(id: number): boolean {
    const customers = this.getCustomers();
    const filtered = customers.filter(c => c.id !== id);
    
    if (filtered.length === customers.length) return false;
    
    this.saveCustomers(filtered);
    return true;
  }

  // Job management
  getJobs(): Job[] {
    try {
      const data = this.storage.getItem('mm_jobs');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveJobs(jobs: Job[]): void {
    this.storage.setItem('mm_jobs', JSON.stringify(jobs));
  }

  addJob(job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Job {
    const jobs = this.getJobs();
    const now = new Date().toISOString();
    const newJob: Job = {
      ...job,
      id: this.getNextId('job'),
      createdAt: now,
      updatedAt: now,
    };
    
    jobs.push(newJob);
    this.saveJobs(jobs);
    return newJob;
  }

  updateJob(id: number, updates: Partial<Job>): Job | null {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === id);
    
    if (index === -1) return null;
    
    jobs[index] = {
      ...jobs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.saveJobs(jobs);
    return jobs[index];
  }

  deleteJob(id: number): boolean {
    const jobs = this.getJobs();
    const filtered = jobs.filter(j => j.id !== id);
    
    if (filtered.length === jobs.length) return false;
    
    this.saveJobs(filtered);
    return true;
  }

  // Dashboard stats
  getDashboardStats() {
    const jobs = this.getJobs();
    const customers = this.getCustomers();
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyJobs = jobs.filter(job => 
      new Date(job.createdAt) >= thisMonth
    );
    
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const paidJobs = jobs.filter(job => job.status === 'paid');
    const activeJobs = jobs.filter(job => job.status === 'active');
    const bookedJobs = jobs.filter(job => job.status === 'booked');
    const estimateJobs = jobs.filter(job => job.status === 'estimate');
    
    // Actual revenue from completed and paid jobs
    const actualRevenue = [...completedJobs, ...paidJobs].reduce((sum, job) => sum + (job.totalCost || 0), 0);
    
    // Potential revenue from booked and estimate jobs
    const potentialRevenue = [...bookedJobs, ...estimateJobs].reduce((sum, job) => sum + (job.totalCost || 0), 0);
    
    // Monthly revenue calculations
    const monthlyCompleted = monthlyJobs.filter(job => job.status === 'completed' || job.status === 'paid');
    const monthlyRevenue = monthlyCompleted.reduce((sum, job) => sum + (job.totalCost || 0), 0);
    
    const monthlyPotential = monthlyJobs.filter(job => job.status === 'booked' || job.status === 'estimate').reduce((sum, job) => sum + (job.totalCost || 0), 0);

    return {
      totalCustomers: customers.length,
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length + paidJobs.length,
      bookedJobs: bookedJobs.length,
      estimateJobs: estimateJobs.length,
      monthlyJobs: monthlyJobs.length,
      actualRevenue,
      potentialRevenue,
      totalRevenue: actualRevenue + potentialRevenue, // Total possible revenue
      monthlyRevenue,
      monthlyPotentialRevenue: monthlyPotential,
      averageJobValue: (completedJobs.length + paidJobs.length) > 0 ? actualRevenue / (completedJobs.length + paidJobs.length) : 0,
    };
  }

  // Financials data
  getFinancials() {
    const jobs = this.getJobs();
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Monthly data for current year
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(currentYear, month, 1);
      const monthEnd = new Date(currentYear, month + 1, 0);
      
      const monthJobs = jobs.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= monthStart && jobDate <= monthEnd && job.status === 'completed';
      });
      
      const revenue = monthJobs.reduce((sum, job) => sum + (job.totalCost || 0), 0);
      const expenses = monthJobs.reduce((sum, job) => sum + (job.materialsCost || 0), 0);
      
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

  // Initialize with sample data if empty
  initializeSampleData(): void {
    if (this.getCustomers().length === 0 && this.getJobs().length === 0) {
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

      sampleCustomers.forEach(customer => this.addCustomer(customer));

      // Add sample jobs
      const customers = this.getCustomers();
      const sampleJobs = [
        {
          customerId: customers[0]?.id || 1,
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
          estimatedHours: 6,
          actualHours: 5.5,
          hourlyRate: 199,
          totalCost: 1094.50,
          paymentStatus: 'paid',
          jobType: 'residential',
          vehicleType: 'truck',
        },
        {
          customerId: customers[1]?.id || 2,
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
          estimatedHours: 4,
          hourlyRate: 149,
          totalCost: 596.00,
          paymentStatus: 'pending',
          jobType: 'residential',
          vehicleType: 'van',
          preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        {
          customerId: customers[2]?.id || 3,
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
          estimatedHours: 8,
          hourlyRate: 249,
          totalCost: 1992.00,
          jobType: 'commercial',
          vehicleType: 'truck',
        },
      ];

      sampleJobs.forEach(job => this.addJob(job));
    }
  }

  // Export data
  exportData() {
    return {
      customers: this.getCustomers(),
      jobs: this.getJobs(),
      exportDate: new Date().toISOString(),
    };
  }

  // Import data
  importData(data: { customers: Customer[], jobs: Job[] }) {
    this.saveCustomers(data.customers);
    this.saveJobs(data.jobs);
  }

  // Clear all data
  clearAllData(): void {
    this.storage.removeItem('mm_customers');
    this.storage.removeItem('mm_jobs');
    this.storage.removeItem('mm_customer_counter');
    this.storage.removeItem('mm_job_counter');
  }
}

export const clientStorage = new ClientStorage();