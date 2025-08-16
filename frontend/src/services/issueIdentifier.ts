import { logger, LogLevel, LogEntry } from './logger';

export interface Issue {
  id: string;
  type: 'error' | 'warning' | 'performance' | 'security' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved' | 'acknowledged';
  affectedComponents: string[];
  recommendations: string[];
  logEntries: LogEntry[];
  metadata: Record<string, any>;
}

export interface IssuePattern {
  id: string;
  name: string;
  description: string;
  conditions: IssueCondition[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'error' | 'warning' | 'performance' | 'security' | 'system';
  recommendations: string[];
}

export interface IssueCondition {
  field: 'level' | 'category' | 'message' | 'details' | 'userId' | 'sessionId';
  operator: 'equals' | 'contains' | 'regex' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
  timeWindow?: number; // in milliseconds
  countThreshold?: number;
}

class IssueIdentifierService {
  private issues: Issue[] = [];
  private patterns: IssuePattern[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private issueCallbacks: ((issue: Issue) => void)[] = [];

  constructor() {
    this.initializeDefaultPatterns();
  }

  private initializeDefaultPatterns() {
    // Error rate patterns
    this.patterns.push({
      id: 'high-error-rate',
      name: 'High Error Rate',
      description: 'Detects when error rate exceeds acceptable thresholds',
      conditions: [
        {
          field: 'level',
          operator: 'equals',
          value: LogLevel.ERROR
        }
      ],
      severity: 'high',
      type: 'error',
      recommendations: [
        'Review recent code changes',
        'Check system resources',
        'Monitor error logs for patterns',
        'Implement circuit breakers if applicable'
      ]
    });

    // Critical error patterns
    this.patterns.push({
      id: 'critical-errors',
      name: 'Critical Errors',
      description: 'Detects critical system errors that require immediate attention',
      conditions: [
        {
          field: 'level',
          operator: 'equals',
          value: LogLevel.CRITICAL
        }
      ],
      severity: 'critical',
      type: 'error',
      recommendations: [
        'Immediate system investigation required',
        'Check system health endpoints',
        'Review recent deployments',
        'Contact system administrators'
      ]
    });

    // Performance degradation patterns
    this.patterns.push({
      id: 'performance-degradation',
      name: 'Performance Degradation',
      description: 'Detects patterns indicating system performance issues',
      conditions: [
        {
          field: 'message',
          operator: 'contains',
          value: 'timeout'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'slow'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'performance'
        }
      ],
      severity: 'medium',
      type: 'performance',
      recommendations: [
        'Monitor response times',
        'Check database performance',
        'Review resource utilization',
        'Consider scaling resources'
      ]
    });

    // Security patterns
    this.patterns.push({
      id: 'security-issues',
      name: 'Security Issues',
      description: 'Detects potential security-related issues',
      conditions: [
        {
          field: 'message',
          operator: 'contains',
          value: 'unauthorized'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'authentication'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'permission'
        }
      ],
      severity: 'high',
      type: 'security',
      recommendations: [
        'Review access logs',
        'Check user permissions',
        'Verify authentication mechanisms',
        'Monitor for suspicious activity'
      ]
    });

    // System resource patterns
    this.patterns.push({
      id: 'system-resource-issues',
      name: 'System Resource Issues',
      description: 'Detects system resource problems',
      conditions: [
        {
          field: 'message',
          operator: 'contains',
          value: 'memory'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'disk'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'cpu'
        }
      ],
      severity: 'medium',
      type: 'system',
      recommendations: [
        'Monitor system resources',
        'Check for memory leaks',
        'Review disk usage',
        'Consider resource scaling'
      ]
    });

    // Database connection patterns
    this.patterns.push({
      id: 'database-connection-issues',
      name: 'Database Connection Issues',
      description: 'Detects database connectivity problems',
      conditions: [
        {
          field: 'message',
          operator: 'contains',
          value: 'connection'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'database'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'sql'
        }
      ],
      severity: 'high',
      type: 'error',
      recommendations: [
        'Check database server status',
        'Verify connection pool settings',
        'Monitor database performance',
        'Review connection timeout settings'
      ]
    });

    // API rate limiting patterns
    this.patterns.push({
      id: 'api-rate-limiting',
      name: 'API Rate Limiting',
      description: 'Detects when API rate limits are being hit',
      conditions: [
        {
          field: 'message',
          operator: 'contains',
          value: 'rate limit'
        },
        {
          field: 'message',
          operator: 'contains',
          value: 'too many requests'
        }
      ],
      severity: 'medium',
      type: 'performance',
      recommendations: [
        'Review API usage patterns',
        'Implement client-side rate limiting',
        'Consider API quota increases',
        'Optimize API calls'
      ]
    });
  }

  // Start monitoring for issues
  public startMonitoring(intervalMs: number = 10000) {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.analyzeLogs();
    }, intervalMs);

    logger.info('IssueIdentifier', 'Issue monitoring started', { intervalMs });
  }

  // Stop monitoring
  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    logger.info('IssueIdentifier', 'Issue monitoring stopped');
  }

  // Analyze logs for issues
  private analyzeLogs() {
    try {
      const recentLogs = logger.getLogs();
      const newIssues: Issue[] = [];

      // Check each pattern against recent logs
      for (const pattern of this.patterns) {
        const matchingLogs = this.findMatchingLogs(recentLogs, pattern.conditions);
        
        if (matchingLogs.length > 0) {
          // Check if this issue already exists
          const existingIssue = this.issues.find(issue => 
            issue.type === pattern.type && 
            issue.status === 'active' &&
            this.isSameIssue(issue, pattern, matchingLogs)
          );

          if (!existingIssue) {
            // Create new issue
            const newIssue = this.createIssue(pattern, matchingLogs);
            newIssues.push(newIssue);
            this.issues.push(newIssue);
            
            // Notify callbacks
            this.notifyIssueDetected(newIssue);
          } else {
            // Update existing issue
            existingIssue.logEntries = [...existingIssue.logEntries, ...matchingLogs];
            existingIssue.metadata.lastUpdated = new Date();
          }
        }
      }

      // Check for resolved issues
      this.checkResolvedIssues(recentLogs);

      if (newIssues.length > 0) {
        logger.info('IssueIdentifier', `Detected ${newIssues.length} new issues`, { 
          issueCount: newIssues.length,
          issueTypes: newIssues.map(i => i.type)
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('IssueIdentifier', 'Error analyzing logs for issues', { error: errorMessage });
    }
  }

  // Find logs matching pattern conditions
  private findMatchingLogs(logs: LogEntry[], conditions: IssueCondition[]): LogEntry[] {
    return logs.filter(log => {
      return conditions.every(condition => {
        return this.evaluateCondition(log, condition);
      });
    });
  }

  // Evaluate a single condition
  private evaluateCondition(log: LogEntry, condition: IssueCondition): boolean {
    const fieldValue = this.getFieldValue(log, condition.field);
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      
      case 'contains':
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          return fieldValue.toLowerCase().includes(condition.value.toLowerCase());
        }
        return false;
      
      case 'regex':
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          try {
            const regex = new RegExp(condition.value, 'i');
            return regex.test(fieldValue);
          } catch {
            return false;
          }
        }
        return false;
      
      case 'greater_than':
        if (typeof fieldValue === 'number' && typeof condition.value === 'number') {
          return fieldValue > condition.value;
        }
        return false;
      
      case 'less_than':
        if (typeof fieldValue === 'number' && typeof condition.value === 'number') {
          return fieldValue < condition.value;
        }
        return false;
      
      case 'in_range':
        if (typeof fieldValue === 'number' && Array.isArray(condition.value) && condition.value.length === 2) {
          return fieldValue >= condition.value[0] && fieldValue <= condition.value[1];
        }
        return false;
      
      default:
        return false;
    }
  }

  // Get field value from log entry
  private getFieldValue(log: LogEntry, field: string): any {
    switch (field) {
      case 'level':
        return log.level;
      case 'category':
        return log.category;
      case 'message':
        return log.message;
      case 'details':
        return log.details;
      case 'userId':
        return log.userId;
      case 'sessionId':
        return log.sessionId;
      default:
        return null;
    }
  }

  // Create a new issue
  private createIssue(pattern: IssuePattern, matchingLogs: LogEntry[]): Issue {
    const issue: Issue = {
      id: `${pattern.id}_${Date.now()}`,
      type: pattern.type,
      severity: pattern.severity,
      title: pattern.name,
      description: pattern.description,
      detectedAt: new Date(),
      status: 'active',
      affectedComponents: this.extractAffectedComponents(matchingLogs),
      recommendations: pattern.recommendations,
      logEntries: matchingLogs,
      metadata: {
        patternId: pattern.id,
        logCount: matchingLogs.length,
        firstOccurrence: matchingLogs[0]?.timestamp,
        lastOccurrence: matchingLogs[matchingLogs.length - 1]?.timestamp,
        created: new Date(),
        lastUpdated: new Date()
      }
    };

    return issue;
  }

  // Extract affected components from logs
  private extractAffectedComponents(logs: LogEntry[]): string[] {
    const components = new Set<string>();
    
    logs.forEach(log => {
      if (log.category) {
        components.add(log.category);
      }
      if (log.details?.component) {
        components.add(log.details.component);
      }
    });

    return Array.from(components);
  }

  // Check if two issues are the same
  private isSameIssue(existingIssue: Issue, pattern: IssuePattern, newLogs: LogEntry[]): boolean {
    // Simple check: same pattern and recent occurrence
    const timeThreshold = 5 * 60 * 1000; // 5 minutes
    const lastLogTime = new Date(newLogs[0]?.timestamp || 0).getTime();
    const existingLastTime = new Date(existingIssue.metadata.lastOccurrence || 0).getTime();
    
    return Math.abs(lastLogTime - existingLastTime) < timeThreshold;
  }

  // Check for resolved issues
  private checkResolvedIssues(recentLogs: LogEntry[]) {
    const now = Date.now();
    const resolutionThreshold = 10 * 60 * 1000; // 10 minutes

    this.issues.forEach(issue => {
      if (issue.status === 'active') {
        const lastOccurrence = new Date(issue.metadata.lastOccurrence || 0).getTime();
        
        if (now - lastOccurrence > resolutionThreshold) {
          issue.status = 'resolved';
          issue.resolvedAt = new Date();
          issue.metadata.resolved = new Date();
          
          logger.info('IssueIdentifier', `Issue resolved: ${issue.title}`, { 
            issueId: issue.id,
            resolutionTime: issue.resolvedAt
          });
        }
      }
    });
  }

  // Add custom pattern
  public addPattern(pattern: IssuePattern) {
    this.patterns.push(pattern);
    logger.info('IssueIdentifier', 'Custom pattern added', { patternId: pattern.id });
  }

  // Remove pattern
  public removePattern(patternId: string) {
    const index = this.patterns.findIndex(p => p.id === patternId);
    if (index !== -1) {
      this.patterns.splice(index, 1);
      logger.info('IssueIdentifier', 'Pattern removed', { patternId });
    }
  }

  // Get all active issues
  public getActiveIssues(): Issue[] {
    return this.issues.filter(issue => issue.status === 'active');
  }

  // Get all issues
  public getAllIssues(): Issue[] {
    return [...this.issues];
  }

  // Get issues by type
  public getIssuesByType(type: Issue['type']): Issue[] {
    return this.issues.filter(issue => issue.type === type);
  }

  // Get issues by severity
  public getIssuesBySeverity(severity: Issue['severity']): Issue[] {
    return this.issues.filter(issue => issue.severity === severity);
  }

  // Acknowledge issue
  public acknowledgeIssue(issueId: string) {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'acknowledged';
      issue.metadata.acknowledged = new Date();
      logger.info('IssueIdentifier', 'Issue acknowledged', { issueId });
    }
  }

  // Resolve issue manually
  public resolveIssue(issueId: string) {
    const issue = this.issues.find(i => i.id === issueId);
    if (issue) {
      issue.status = 'resolved';
      issue.resolvedAt = new Date();
      issue.metadata.resolved = new Date();
      issue.metadata.manuallyResolved = true;
      logger.info('IssueIdentifier', 'Issue manually resolved', { issueId });
    }
  }

  // Subscribe to issue notifications
  public onIssueDetected(callback: (issue: Issue) => void) {
    this.issueCallbacks.push(callback);
  }

  // Unsubscribe from issue notifications
  public offIssueDetected(callback: (issue: Issue) => void) {
    const index = this.issueCallbacks.indexOf(callback);
    if (index !== -1) {
      this.issueCallbacks.splice(index, 1);
    }
  }

  // Notify callbacks of detected issues
  private notifyIssueDetected(issue: Issue) {
    this.issueCallbacks.forEach(callback => {
      try {
        callback(issue);
          } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('IssueIdentifier', 'Error in issue callback', { error: errorMessage });
    }
    });
  }

  // Get issue statistics
  public getIssueStats() {
    const total = this.issues.length;
    const active = this.issues.filter(i => i.status === 'active').length;
    const resolved = this.issues.filter(i => i.status === 'resolved').length;
    const acknowledged = this.issues.filter(i => i.status === 'acknowledged').length;

    const byType = this.issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      resolved,
      acknowledged,
      byType,
      bySeverity
    };
  }

  // Clear all issues
  public clearIssues() {
    this.issues = [];
    logger.info('IssueIdentifier', 'All issues cleared');
  }

  // Export issues
  public exportIssues(): string {
    return JSON.stringify(this.issues, null, 2);
  }
}

// Create singleton instance
export const issueIdentifier = new IssueIdentifierService();

// Auto-start monitoring when service is imported
issueIdentifier.startMonitoring();
