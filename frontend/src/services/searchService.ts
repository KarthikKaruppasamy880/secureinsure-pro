import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface SearchResult {
  id: string;
  type: 'policy' | 'claim' | 'customer' | 'document' | 'notification';
  title: string;
  description: string;
  url: string;
  score: number;
  highlights: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  type?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  status?: string[];
  priority?: string[];
  category?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface SearchSuggestion {
  text: string;
  type: string;
  count: number;
  score: number;
}

export interface SearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{ query: string; count: number }>;
  searchByType: Record<string, number>;
  averageResultsPerSearch: number;
  searchSuccessRate: number;
  topResults: SearchResult[];
}

export interface SearchIndex {
  id: string;
  name: string;
  type: string;
  status: 'indexing' | 'active' | 'error' | 'disabled';
  documentCount: number;
  lastIndexed: string;
  createdAt: string;
  updatedAt: string;
}

export const searchService = {
  // Global search across all indexed content
  async globalSearch(query: string, filters?: SearchFilters, page = 0, size = 20): Promise<{
    content: SearchResult[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    query: string;
    processingTime: number;
    suggestions: SearchSuggestion[];
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      if (filters.type) {
        filters.type.forEach(type => params.append('type', type));
      }
      if (filters.dateRange) {
        params.append('startDate', filters.dateRange.start);
        params.append('endDate', filters.dateRange.end);
      }
      if (filters.status) {
        filters.status.forEach(status => params.append('status', status));
      }
      if (filters.priority) {
        filters.priority.forEach(priority => params.append('priority', priority));
      }
      if (filters.category) {
        filters.category.forEach(category => params.append('category', category));
      }
      if (filters.tags) {
        filters.tags.forEach(tag => params.append('tags', tag));
      }
      if (filters.customFields) {
        Object.entries(filters.customFields).forEach(([key, value]) => {
          params.append(`custom.${key}`, value.toString());
        });
      }
    }

    const response = await api.get(`/search?${params.toString()}`);
    return response.data;
  },

  // Search within specific content type
  async searchByType(type: string, query: string, filters?: SearchFilters, page = 0, size = 20): Promise<{
    content: SearchResult[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    query: string;
    processingTime: number;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/search/${type}?${params.toString()}`);
    return response.data;
  },

  // Get search suggestions/autocomplete
  async getSearchSuggestions(query: string, type?: string, limit = 10): Promise<SearchSuggestion[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    if (type) {
      params.append('type', type);
    }

    const response = await api.get(`/search/suggestions?${params.toString()}`);
    return response.data;
  },

  // Get popular searches
  async getPopularSearches(limit = 10): Promise<Array<{ query: string; count: number }>> {
    const response = await api.get(`/search/popular?limit=${limit}`);
    return response.data;
  },

  // Get search analytics
  async getSearchAnalytics(dateRange?: { start: string; end: string }): Promise<SearchAnalytics> {
    const params = new URLSearchParams();
    if (dateRange) {
      params.append('startDate', dateRange.start);
      params.append('endDate', dateRange.end);
    }

    const response = await api.get(`/search/analytics?${params.toString()}`);
    return response.data;
  },

  // Index specific content
  async indexContent(contentData: {
    id: string;
    type: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    tags?: string[];
  }): Promise<void> {
    await api.post('/search/index', contentData);
  },

  // Bulk index content
  async bulkIndexContent(contentData: Array<{
    id: string;
    type: string;
    title: string;
    content: string;
    metadata?: Record<string, any>;
    tags?: string[];
  }>): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; message: string }>;
  }> {
    const response = await api.post('/search/bulk-index', { content: contentData });
    return response.data;
  },

  // Remove content from index
  async removeFromIndex(id: string, type: string): Promise<void> {
    await api.delete(`/search/index/${type}/${id}`);
  },

  // Get search indices
  async getSearchIndices(): Promise<SearchIndex[]> {
    const response = await api.get('/search/indices');
    return response.data;
  },

  // Create search index
  async createSearchIndex(indexData: {
    name: string;
    type: string;
    settings?: Record<string, any>;
  }): Promise<SearchIndex> {
    const response = await api.post('/search/indices', indexData);
    return response.data;
  },

  // Update search index
  async updateSearchIndex(indexId: string, indexData: {
    name?: string;
    settings?: Record<string, any>;
  }): Promise<SearchIndex> {
    const response = await api.put(`/search/indices/${indexId}`, indexData);
    return response.data;
  },

  // Delete search index
  async deleteSearchIndex(indexId: string): Promise<void> {
    await api.delete(`/search/indices/${indexId}`);
  },

  // Reindex all content
  async reindexAll(): Promise<{
    success: boolean;
    message: string;
    estimatedTime: number;
  }> {
    const response = await api.post('/search/reindex');
    return response.data;
  },

  // Get reindex status
  async getReindexStatus(): Promise<{
    status: 'idle' | 'running' | 'completed' | 'failed';
    progress: number;
    totalDocuments: number;
    processedDocuments: number;
    startTime?: string;
    endTime?: string;
    errorMessage?: string;
  }> {
    const response = await api.get('/search/reindex/status');
    return response.data;
  },

  // Search within policies
  async searchPolicies(query: string, filters?: {
    status?: string[];
    type?: string[];
    agentId?: string;
    customerId?: string;
    dateRange?: { start: string; end: string };
  }, page = 0, size = 20): Promise<{
    content: SearchResult[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/search/policies?${params.toString()}`);
    return response.data;
  },

  // Search within claims
  async searchClaims(query: string, filters?: {
    status?: string[];
    type?: string[];
    priority?: string[];
    assignedToId?: string;
    customerId?: string;
    dateRange?: { start: string; end: string };
  }, page = 0, size = 20): Promise<{
    content: SearchResult[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/search/claims?${params.toString()}`);
    return response.data;
  },

  // Search within customers
  async searchCustomers(query: string, filters?: {
    status?: string[];
    type?: string[];
    dateRange?: { start: string; end: string };
  }, page = 0, size = 20): Promise<{
    content: SearchResult[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/search/customers?${params.toString()}`);
    return response.data;
  },

  // Search within documents
  async searchDocuments(query: string, filters?: {
    type?: string[];
    category?: string[];
    uploadedBy?: string;
    dateRange?: { start: string; end: string };
  }, page = 0, size = 20): Promise<{
    content: SearchResult[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/search/documents?${params.toString()}`);
    return response.data;
  },

  // Export search results
  async exportSearchResults(query: string, filters?: SearchFilters, format = 'csv'): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('format', format);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/search/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
}; 