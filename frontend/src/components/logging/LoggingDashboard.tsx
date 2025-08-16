import React, { useState, useEffect, useCallback } from 'react';
import { logger, LogLevel, LogEntry, LogFilter } from '../../services/logger';
import { toast } from 'react-hot-toast';

interface SystemHealth {
  healthy: boolean;
  memoryHealthy: boolean;
  threadHealthy: boolean;
  errorRateHealthy: boolean;
  performanceHealthy: boolean;
  memoryUsagePercent: number;
  threadCount: number;
  errorRate: number;
  systemLoadAverage: number;
}

const LoggingDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogFilter>({});
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch system health from backend
  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/logs/health');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.health) {
          setSystemHealth(data.health);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('LoggingDashboard', 'Failed to fetch system health', { error: errorMessage });
    }
  }, []);

  // Refresh logs
  const refreshLogs = useCallback(() => {
    setIsRefreshing(true);
    try {
      const filteredLogs = logger.getLogs(filter);
      setLogs(filteredLogs);
      
      // Check for critical issues
      if (logger.hasCriticalIssues()) {
        toast.error('Critical issues detected! Check logs immediately.', { duration: 10000 });
      }
      
      // Check system health
      const health = logger.getSystemHealth();
      if (health === 'critical') {
        toast.error('System health is CRITICAL!', { duration: 10000 });
      } else if (health === 'warning') {
        toast('System health is WARNING!', { 
          duration: 5000,
          icon: '⚠️'
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('LoggingDashboard', 'Failed to refresh logs', { error: errorMessage });
      toast.error('Failed to refresh logs');
    } finally {
      setIsRefreshing(false);
    }
  }, [filter]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refreshLogs();
      fetchSystemHealth();
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshLogs, fetchSystemHealth]);

  // Initial load
  useEffect(() => {
    refreshLogs();
    fetchSystemHealth();
  }, [refreshLogs, fetchSystemHealth]);

  // Handle filter changes
  const handleFilterChange = (key: keyof LogFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilter({});
  };

  // Export logs
  const handleExport = (format: 'json' | 'csv') => {
    try {
      logger.downloadLogs(format);
      toast.success(`Logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('LoggingDashboard', 'Failed to export logs', { error: errorMessage });
      toast.error('Failed to export logs');
    }
  };

  // Clear logs
  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      try {
        logger.clearLogs();
        setLogs([]);
        toast.success('All logs cleared');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('LoggingDashboard', 'Failed to clear logs', { error: errorMessage });
        toast.error('Failed to clear logs');
      }
    }
  };

  // Get log level color
  const getLogLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.CRITICAL:
        return 'bg-red-600 text-white';
      case LogLevel.ERROR:
        return 'bg-red-500 text-white';
      case LogLevel.WARN:
        return 'bg-yellow-500 text-white';
      case LogLevel.INFO:
        return 'bg-blue-500 text-white';
      case LogLevel.DEBUG:
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  // Get system health color
  const getHealthColor = (healthy: boolean) => {
    return healthy ? 'text-green-600' : 'text-red-600';
  };

  // Get system health icon
  const getHealthIcon = (healthy: boolean) => {
    return healthy ? '✅' : '❌';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Logging Dashboard</h1>
              <p className="text-gray-600 mt-2">Real-time monitoring and issue identification</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshLogs}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Auto-refresh</span>
              </label>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🏥</div>
                <div className={`font-semibold ${getHealthColor(systemHealth.healthy)}`}>
                  {getHealthIcon(systemHealth.healthy)} Overall
                </div>
                <div className="text-sm text-gray-600">
                  {systemHealth.healthy ? 'Healthy' : 'Unhealthy'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">💾</div>
                <div className={`font-semibold ${getHealthColor(systemHealth.memoryHealthy)}`}>
                  {getHealthIcon(systemHealth.memoryHealthy)} Memory
                </div>
                <div className="text-sm text-gray-600">
                  {systemHealth.memoryUsagePercent.toFixed(1)}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">🧵</div>
                <div className={`font-semibold ${getHealthColor(systemHealth.threadHealthy)}`}>
                  {getHealthIcon(systemHealth.threadHealthy)} Threads
                </div>
                <div className="text-sm text-gray-600">
                  {systemHealth.threadCount}
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">⚠️</div>
                <div className={`font-semibold ${getHealthColor(systemHealth.errorRateHealthy)}`}>
                  {getHealthIcon(systemHealth.errorRateHealthy)} Error Rate
                </div>
                <div className="text-sm text-gray-600">
                  {systemHealth.errorRate.toFixed(2)}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">⚡</div>
                <div className={`font-semibold ${getHealthColor(systemHealth.performanceHealthy)}`}>
                  {getHealthIcon(systemHealth.performanceHealthy)} Performance
                </div>
                <div className="text-sm text-gray-600">
                  {systemHealth.systemLoadAverage.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Log Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Log Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(logger.getLogStats()).map(([level, count]) => (
              <div key={level} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getLogLevelColor(level as LogLevel)}`}>
                  {count}
                </div>
                <div className="text-sm text-gray-600 capitalize">{level}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Log Filters</h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                <select
                  value={filter.level || ''}
                  onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  {Object.values(LogLevel).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={filter.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  placeholder="Enter category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Text</label>
                <input
                  type="text"
                  value={filter.searchText || ''}
                  onChange={(e) => handleFilterChange('searchText', e.target.value || undefined)}
                  placeholder="Search in messages"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end space-x-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Clear
                </button>
                <button
                  onClick={refreshLogs}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export CSV
            </button>
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear All Logs
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Log Entries ({logs.length})</h2>
          
          {logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No logs found matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogLevelColor(log.level)}`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.userId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Log Entry Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLogLevelColor(selectedLog.level)}`}>
                    {selectedLog.level}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.message}</p>
                </div>
                
                {selectedLog.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Details</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.stackTrace && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stack Trace</label>
                    <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded overflow-auto max-h-40">
                      {selectedLog.stackTrace}
                    </pre>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.userId || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Session ID</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.sessionId || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.url || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="mt-1 text-sm text-gray-900 truncate">{selectedLog.userAgent || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggingDashboard;
