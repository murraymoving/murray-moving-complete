import type { Job, InsertJob } from "@shared/schema";

// Murray Moving Official Tariff Rates and Calculations
export class MurrayTariffCalculator {
  // Official Tariff Rates (2 Movers + Van/Truck: $149/hr, 3 Movers: $199/hr, 4 Movers: $249/hr)
  private static readonly HOURLY_RATES = {
    1: 59.00,   // Labor Only (1 Mover): $59/hr
    2: 149.00,  // 2 Movers + Van/Truck: $149/hr
    3: 199.00,  // 3 Movers + Van/Truck: $199/hr
    4: 249.00,  // 4 Movers + Van/Truck: $249/hr
    5: 309.00,  // 4 + Additional Mover ($60/hr)
  };

  // Labor Only Rates
  private static readonly LABOR_ONLY_RATES = {
    1: 59.00,   // Labor Only (1 Mover): $59/hr
    2: 85.00,   // Labor Only (2 Movers): $85/hr
  };

  // Travel Fee: $99 flat + $1.99/mi (round trip)
  private static readonly TRAVEL_BASE_FEE = 99.00;
  private static readonly TRAVEL_MILEAGE_RATE = 1.99; // per mile round trip
  private static readonly OVER_50_MILE_RATE = 1.99; // per mile for jobs over 50 miles
  
  // Additional Fees
  private static readonly BOX_OVERAGE_THRESHOLD = 0.25; // 25% threshold
  private static readonly BOX_OVERAGE_FEE = 5.00; // per box beyond 25%
  private static readonly MATTRESS_BAG_FEE = 15.00; // per bag

  /**
   * Calculate travel fee based on distance
   */
  static calculateTravelFee(distanceMiles: number): number {
    const roundTripDistance = distanceMiles * 2;
    return this.TRAVEL_BASE_FEE + (roundTripDistance * this.TRAVEL_MILEAGE_RATE);
  }

  /**
   * Calculate mileage fee for over-50-mile jobs
   */
  static calculateMileageFee(distanceMiles: number): number {
    if (distanceMiles <= 50) return 0;
    return distanceMiles * this.OVER_50_MILE_RATE;
  }

  /**
   * Calculate box overage fee
   */
  static calculateBoxOverageFee(quotedBoxes: number, actualBoxes: number): number {
    const threshold = quotedBoxes * (1 + this.BOX_OVERAGE_THRESHOLD);
    if (actualBoxes <= threshold) return 0;
    
    const overageBoxes = actualBoxes - threshold;
    return Math.ceil(overageBoxes) * this.BOX_OVERAGE_FEE;
  }

  /**
   * Calculate mattress bag fee
   */
  static calculateMattressBagFee(bagCount: number): number {
    return bagCount * this.MATTRESS_BAG_FEE;
  }

  /**
   * Get minimum hours based on crew size, season, and job type
   */
  static getMinimumHours(
    crewSize: number, 
    isOddJob: boolean = false, 
    preferredDate?: string,
    isWeekend: boolean = false,
    isHoliday: boolean = false
  ): number {
    // Van-only and odd jobs may be billed at reduced mins at our discretion
    if (isOddJob) {
      return 2.0; // Reduced minimum for odd jobs
    }

    const now = new Date();
    const jobDate = preferredDate ? new Date(preferredDate) : now;
    const month = jobDate.getMonth() + 1; // 1-12
    
    // Determine season: Oct 1 - May 1 vs May 2 - Sep 30
    const isBusySeason = month >= 5 && month <= 9; // May 2 - Sep 30
    
    let minimumHours: number;
    
    if (isBusySeason) {
      // May 2 - September 30 (Busy Season)
      if (crewSize === 2) minimumHours = 4;
      else if (crewSize === 3) minimumHours = 6;
      else if (crewSize >= 4) minimumHours = 7;
      else minimumHours = 3; // Default for 1 person
    } else {
      // October 1 - May 1 (Off Season)
      if (crewSize === 2) minimumHours = 3;
      else if (crewSize === 3) minimumHours = 5;
      else if (crewSize >= 4) minimumHours = 6;
      else minimumHours = 3; // Default for 1 person
    }
    
    // Saturday: Add 1 hour to minimum
    if (isWeekend && jobDate.getDay() === 6) {
      minimumHours += 1;
    }
    
    // Sunday/Holiday: Add 2 hours to minimum
    if (isHoliday || (isWeekend && jobDate.getDay() === 0)) {
      minimumHours += 2;
    }
    
    return minimumHours;
  }

  /**
   * Calculate labor cost based on crew size, hours, and job type
   */
  static calculateLaborCost(
    crewSize: number, 
    hours: number, 
    isLaborOnly: boolean = false,
    isOddJob: boolean = false,
    preferredDate?: string,
    isWeekend: boolean = false,
    isHoliday: boolean = false
  ): { cost: number; breakdown: any } {
    let hourlyRate: number;
    
    if (isLaborOnly && crewSize <= 2) {
      hourlyRate = this.LABOR_ONLY_RATES[crewSize as keyof typeof this.LABOR_ONLY_RATES] || this.LABOR_ONLY_RATES[1];
    } else {
      hourlyRate = this.HOURLY_RATES[crewSize as keyof typeof this.HOURLY_RATES] || this.HOURLY_RATES[2];
    }
    
    const minimumHours = this.getMinimumHours(crewSize, isOddJob, preferredDate, isWeekend, isHoliday);
    const billableHours = Math.max(hours, minimumHours);
    
    return {
      cost: hourlyRate * billableHours,
      breakdown: {
        hourlyRate,
        minimumHours,
        actualHours: hours,
        billableHours,
        isOddJob,
        isLaborOnly
      }
    };
  }

  /**
   * Calculate total job estimate following official tariff
   */
  static calculateJobEstimate(jobData: {
    crewSize: number;
    estimatedHours: number;
    distanceMiles: number;
    boxCountQuoted: number;
    mattressBagCount: number;
    materialsCost?: number;
    isOddJob?: boolean;
    isLaborOnly?: boolean;
    preferredDate?: string;
    isWeekend?: boolean;
    isHoliday?: boolean;
  }): {
    laborCost: number;
    travelFee: number;
    mileageFee: number;
    mattressBagFee: number;
    materialsCost: number;
    totalEstimate: number;
    breakdown: any;
  } {
    const laborCalc = this.calculateLaborCost(
      jobData.crewSize, 
      jobData.estimatedHours,
      jobData.isLaborOnly,
      jobData.isOddJob,
      jobData.preferredDate,
      jobData.isWeekend,
      jobData.isHoliday
    );
    
    const travelFee = this.calculateTravelFee(jobData.distanceMiles);
    const mileageFee = this.calculateMileageFee(jobData.distanceMiles);
    const mattressBagFee = this.calculateMattressBagFee(jobData.mattressBagCount);
    const materialsCost = jobData.materialsCost || 0;

    const totalEstimate = laborCalc.cost + travelFee + mileageFee + mattressBagFee + materialsCost;

    return {
      laborCost: laborCalc.cost,
      travelFee,
      mileageFee,
      mattressBagFee,
      materialsCost,
      totalEstimate,
      breakdown: laborCalc.breakdown,
    };
  }

  /**
   * Calculate actual job cost (including overages) following official tariff
   */
  static calculateJobActual(jobData: {
    crewSize: number;
    actualHours: number;
    distanceMiles: number;
    boxCountQuoted: number;
    actualBoxCount: number;
    mattressBagCount: number;
    materialsCost?: number;
    isOddJob?: boolean;
    isLaborOnly?: boolean;
    preferredDate?: string;
    isWeekend?: boolean;
    isHoliday?: boolean;
  }): {
    laborCost: number;
    travelFee: number;
    mileageFee: number;
    boxOverageFee: number;
    mattressBagFee: number;
    materialsCost: number;
    totalActual: number;
    breakdown: any;
  } {
    const laborCalc = this.calculateLaborCost(
      jobData.crewSize, 
      jobData.actualHours,
      jobData.isLaborOnly,
      jobData.isOddJob,
      jobData.preferredDate,
      jobData.isWeekend,
      jobData.isHoliday
    );
    
    const travelFee = this.calculateTravelFee(jobData.distanceMiles);
    const mileageFee = this.calculateMileageFee(jobData.distanceMiles);
    const boxOverageFee = this.calculateBoxOverageFee(jobData.boxCountQuoted, jobData.actualBoxCount);
    const mattressBagFee = this.calculateMattressBagFee(jobData.mattressBagCount);
    const materialsCost = jobData.materialsCost || 0;

    const totalActual = laborCalc.cost + travelFee + mileageFee + boxOverageFee + mattressBagFee + materialsCost;

    return {
      laborCost: laborCalc.cost,
      travelFee,
      mileageFee,
      boxOverageFee,
      mattressBagFee,
      materialsCost,
      totalActual,
      breakdown: laborCalc.breakdown,
    };
  }

  /**
   * Calculate profit for a job
   */
  static calculateJobProfit(revenue: number, expenses: {
    crewPay?: number;
    fuelCost?: number;
    rentalCost?: number;
    materialsCost?: number;
    other?: number;
  }): {
    totalExpenses: number;
    profit: number;
    profitMargin: number;
  } {
    const totalExpenses = (expenses.crewPay || 0) + 
                         (expenses.fuelCost || 0) + 
                         (expenses.rentalCost || 0) + 
                         (expenses.materialsCost || 0) + 
                         (expenses.other || 0);
    
    const profit = revenue - totalExpenses;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      totalExpenses,
      profit,
      profitMargin,
    };
  }

  /**
   * Get distance in miles between two addresses (placeholder for Google Maps API)
   */
  static async calculateDistance(originAddress: string, destinationAddress: string): Promise<number> {
    // Placeholder - in production you'd use Google Maps Distance Matrix API
    // For now, return a rough estimate based on zip codes or manual input
    return 25; // Default 25 miles
  }

  /**
   * Generate job number
   */
  static generateJobNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MV${year}${month}${day}-${random}`;
  }

  /**
   * Generate invoice number
   */
  static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  }
}

// Utility functions for job management
export class JobUtils {
  /**
   * Check if job can transition to new status
   */
  static canTransitionTo(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'lead': ['estimate', 'booked'],
      'estimate': ['booked', 'lead'],
      'booked': ['active', 'estimate'],
      'active': ['completed', 'booked'],
      'completed': ['paid', 'active'],
      'paid': [], // Final status
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Get next valid statuses for a job
   */
  static getNextValidStatuses(currentStatus: string): string[] {
    const validTransitions: Record<string, string[]> = {
      'lead': ['estimate', 'booked'],
      'estimate': ['booked'],
      'booked': ['active'],
      'active': ['completed'],
      'completed': ['paid'],
      'paid': [],
    };

    return validTransitions[currentStatus] || [];
  }

  /**
   * Get status display name
   */
  static getStatusDisplayName(status: string): string {
    const statusNames: Record<string, string> = {
      'lead': 'Lead',
      'estimate': 'Estimate Sent',
      'booked': 'Booked',
      'active': 'In Progress',
      'completed': 'Completed',
      'paid': 'Paid',
    };

    return statusNames[status] || status;
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      'lead': 'bg-gray-100 text-gray-800',
      'estimate': 'bg-blue-100 text-blue-800',
      'booked': 'bg-green-100 text-green-800',
      'active': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-purple-100 text-purple-800',
      'paid': 'bg-emerald-100 text-emerald-800',
    };

    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }
}