import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  X, 
  FileText, 
  User, 
  Shield, 
  AlertTriangle,
  Calendar,
  Star,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  type: 'policy' | 'claim' | 'user' | 'document' | 'notification';
  title: string;
  description: string;
  content: string;
  tags: string[];
  priority: number;
  relevance: number;
  lastUpdated: string;
  metadata: Record<string, any>;
}

interface SearchFilters {
  type: string;
  priority: string;
  dateRange: string;
  tags: string[];
}

interface SearchInterfaceProps {
  onResultSelect?: (result: SearchResult) => void;
  onAdvancedSearch?: () => void;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onResultSelect, onAdvancedSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    type: 'all',
    priority: 'all',
    dateRange: 'all',
    tags: []
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search query
  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['search', searchQuery, activeFilters],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      
      const response = await api.post('/api/v1/search', {
        query: searchQuery,
        filters: activeFilters
      });
      const data = response.data;
      return data as SearchResult[];
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Popular searches
  const { data: popularSearches } = useQuery({
    queryKey: ['popular-searches'],
    queryFn: async () => {
      const response = await api.get('/api/v1/search/popular');
      const data = response.data;
      return data as string[];
    }
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setSearchQuery(query);
      setIsSearching(true);
      
      // Add to search history
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      
      // Add to recent searches
      const newRecent = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
      setRecentSearches(newRecent);
    }
  };

  const handleQuickSearch = (query: string) => {
    handleSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const getResultIcon = (type: string) => {
    const iconMap = {
      policy: <Shield className="h-4 w-4" />,
      claim: <AlertTriangle className="h-4 w-4" />,
      user: <User className="h-4 w-4" />,
      document: <FileText className="h-4 w-4" />,
      notification: <Clock className="h-4 w-4" />
    };
    return iconMap[type as keyof typeof iconMap] || <FileText className="h-4 w-4" />;
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 8) {
      return <Badge variant="destructive" className="bg-red-100 text-red-800">High</Badge>;
    } else if (priority >= 5) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
    }
  };

  const getRelevanceScore = (relevance: number) => {
    const percentage = Math.round(relevance * 100);
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 text-yellow-500" />
        <span className="text-xs text-muted-foreground">{percentage}%</span>
      </div>
    );
  };

  const highlightQuery = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Search</h2>
          <p className="text-muted-foreground">
            Search across policies, claims, users, and documents
          </p>
        </div>
        <Button onClick={onAdvancedSearch} variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Search
        </Button>
      </div>

      {/* Search Input */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for policies, claims, users, documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-2 h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Search Filters */}
          {isSearching && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={activeFilters.type} onValueChange={(value) => setActiveFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="policy">Policies</SelectItem>
                  <SelectItem value="claim">Claims</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                  <SelectItem value="notification">Notifications</SelectItem>
                </SelectContent>
              </Select>

              <Select value={activeFilters.priority} onValueChange={(value) => setActiveFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={activeFilters.dateRange} onValueChange={(value) => setActiveFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={() => refetch()} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {isSearching && (
        <Tabs defaultValue="results" className="space-y-4">
          <TabsList>
            <TabsTrigger value="results">Results ({searchResults?.length || 0})</TabsTrigger>
            <TabsTrigger value="recent">Recent Searches</TabsTrigger>
            <TabsTrigger value="popular">Popular Searches</TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-8 w-8 animate-spin" />
                <span className="ml-2">Searching...</span>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-red-600">
                    <p>Search failed</p>
                    <Button onClick={() => refetch()} variant="outline" className="mt-2">
                      Retry
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getResultIcon(result.type)}
                            <h3 className="font-semibold">
                              {highlightQuery(result.title, searchQuery)}
                            </h3>
                            {getPriorityBadge(result.priority)}
                            {getRelevanceScore(result.relevance)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {highlightQuery(result.description, searchQuery)}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(result.lastUpdated), 'MMM dd, yyyy')}
                            </span>
                            <span className="capitalize">{result.type}</span>
                            {result.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span>Tags:</span>
                                {result.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {result.tags.length > 3 && (
                                  <span>+{result.tags.length - 3}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onResultSelect?.(result)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Download or open result
                              toast.info(`Opening ${result.type}: ${result.title}`);
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchQuery && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found for &quot;{searchQuery}&quot;</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Searches</CardTitle>
              </CardHeader>
              <CardContent>
                {recentSearches.length > 0 ? (
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleQuickSearch(search)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {search}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No recent searches</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular Searches</CardTitle>
              </CardHeader>
              <CardContent>
                {popularSearches && popularSearches.length > 0 ? (
                  <div className="space-y-2">
                    {popularSearches.map((search, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleQuickSearch(search)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        {search}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No popular searches available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SearchInterface; 