// Client-side query client that mimics TanStack Query behavior
// Uses localStorage instead of API calls

import { clientStorage, Customer, Job } from './clientStorage';

export interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface MutationResult<T> {
  mutate: (variables: any) => Promise<T>;
  isPending: boolean;
  error: Error | null;
}

class ClientQueryClient {
  private cache = new Map<string, any>();
  private subscriptions = new Map<string, Set<() => void>>();

  // Simulate loading delay for better UX
  private async simulateLoading<T>(fn: () => T, delay = 50): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, delay));
    return fn();
  }

  // Query implementation
  useQuery<T>(options: {
    queryKey: (string | number | object)[];
    enabled?: boolean;
    refetchInterval?: number;
  }): QueryResult<T> {
    const { queryKey, enabled = true, refetchInterval } = options;
    const key = JSON.stringify(queryKey);
    
    if (!enabled) {
      return {
        data: undefined,
        isLoading: false,
        error: null,
        refetch: () => {},
      };
    }

    const refetch = () => {
      this.cache.delete(key);
      this.notifySubscribers(key);
      // Force re-render by triggering a component update
      setTimeout(() => window.dispatchEvent(new Event('storage')), 10);
    };

    // Set up polling if refetchInterval is provided
    if (refetchInterval && !this.subscriptions.has(key)) {
      setInterval(refetch, refetchInterval);
    }

    // Get fresh data on every call (ignore cache for dashboard stats)
    const data = this.getQueryData<T>(key, queryKey);
    
    return {
      data,
      isLoading: false, // Since we're using localStorage, no async loading
      error: null,
      refetch,
    };
  }

  // Mutation implementation
  useMutation<T>(options: {
    mutationFn: (variables: any) => Promise<T> | T;
    onSuccess?: (data: T) => void;
  }): MutationResult<T> {
    let isPending = false;

    const mutate = async (variables: any): Promise<T> => {
      isPending = true;
      try {
        const result = await this.simulateLoading(() => options.mutationFn(variables));
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } finally {
        isPending = false;
      }
    };

    return {
      mutate,
      isPending,
      error: null,
    };
  }

  // Get data based on query key
  private getQueryData<T>(cacheKey: string, queryKey: (string | number | object)[]): T | undefined {
    const [endpoint, params] = queryKey;
    
    switch (endpoint) {
      case '/api/dashboard/stats':
        return clientStorage.getDashboardStats() as T;
        
      case '/api/dashboard/financials':
        return clientStorage.getFinancials() as T;
        
      case '/api/jobs': {
        let jobs = clientStorage.getJobs();
        if (params && typeof params === 'object' && 'status' in params) {
          jobs = jobs.filter(job => job.status === params.status);
        }
        return jobs as T;
      }
      
      case '/api/customers':
        return clientStorage.getCustomers() as T;
        
      default:
        // Handle dynamic endpoints
        if (typeof endpoint === 'string') {
          if (endpoint.startsWith('/api/jobs/')) {
            const id = parseInt(endpoint.split('/')[3]);
            const job = clientStorage.getJobs().find(j => j.id === id);
            return job as T;
          }
          
          if (endpoint.startsWith('/api/customers/')) {
            const id = parseInt(endpoint.split('/')[3]);
            const customer = clientStorage.getCustomers().find(c => c.id === id);
            return customer as T;
          }
        }
        
        return undefined;
    }
  }

  // Cache invalidation
  invalidateQuery(queryKey: string | (string | number | object)[]): void {
    const key = typeof queryKey === 'string' ? queryKey : JSON.stringify(queryKey);
    this.cache.delete(key);
  }

  // Subscription management
  private notifySubscribers(key: string): void {
    const subscribers = this.subscriptions.get(key);
    if (subscribers) {
      subscribers.forEach(callback => callback());
    }
  }

  // API request simulation for mutations
  async apiRequest(endpoint: string, options: {
    method: string;
    body?: any;
  }): Promise<any> {
    const { method, body } = options;
    
    await this.simulateLoading(() => {}, 100); // Simulate network delay
    
    let result;
    switch (method) {
      case 'POST':
        if (endpoint === '/api/customers') {
          result = clientStorage.addCustomer(body);
          this.invalidateQuery(['/api/customers']);
          this.invalidateQuery(['/api/dashboard/stats']);
        } else if (endpoint === '/api/jobs') {
          result = clientStorage.addJob(body);
          this.invalidateQuery(['/api/jobs']);
          this.invalidateQuery(['/api/dashboard/stats']);
          this.invalidateQuery(['/api/dashboard/financials']);
          // Force immediate refresh of dashboard
          setTimeout(() => {
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('murrayRefresh'));
          }, 10);
        }
        break;
        
      case 'PATCH':
        if (endpoint.startsWith('/api/customers/')) {
          const id = parseInt(endpoint.split('/')[3]);
          result = clientStorage.updateCustomer(id, body);
          this.invalidateQuery(['/api/customers']);
          this.invalidateQuery(['/api/dashboard/stats']);
        } else if (endpoint.startsWith('/api/jobs/')) {
          const id = parseInt(endpoint.split('/')[3]);
          result = clientStorage.updateJob(id, body);
          this.invalidateQuery(['/api/jobs']);
          this.invalidateQuery(['/api/dashboard/stats']);
          this.invalidateQuery(['/api/dashboard/financials']);
          // Force immediate refresh of dashboard
          setTimeout(() => {
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('murrayRefresh'));
          }, 10);
        }
        break;
        
      case 'DELETE':
        if (endpoint.startsWith('/api/customers/')) {
          const id = parseInt(endpoint.split('/')[3]);
          result = { success: clientStorage.deleteCustomer(id) };
          this.invalidateQuery(['/api/customers']);
          this.invalidateQuery(['/api/dashboard/stats']);
        } else if (endpoint.startsWith('/api/jobs/')) {
          const id = parseInt(endpoint.split('/')[3]);
          result = { success: clientStorage.deleteJob(id) };
          this.invalidateQuery(['/api/jobs']);
          this.invalidateQuery(['/api/dashboard/stats']);
          this.invalidateQuery(['/api/dashboard/financials']);
        }
        break;
    }
    
    if (!result) {
      throw new Error(`Unsupported API endpoint: ${method} ${endpoint}`);
    }
    
    return result;
  }
}

export const clientQueryClient = new ClientQueryClient();

// Export hooks that components can use
export const useQuery = <T>(options: {
  queryKey: (string | number | object)[];
  enabled?: boolean;
  refetchInterval?: number;
}): QueryResult<T> => {
  return clientQueryClient.useQuery<T>(options);
};

export const useMutation = <T>(options: {
  mutationFn: (variables: any) => Promise<T> | T;
  onSuccess?: (data: T) => void;
}): MutationResult<T> => {
  return clientQueryClient.useMutation<T>(options);
};

// API request function for mutations
export const apiRequest = (endpoint: string, options: {
  method: string;
  body?: any;
}): Promise<any> => {
  return clientQueryClient.apiRequest(endpoint, options);
};