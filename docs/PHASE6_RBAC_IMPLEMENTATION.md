# Phase 6: RBAC (Role-Based Access Control) Implementation

## Overview

Phase 6 implements a comprehensive Role-Based Access Control (RBAC) system with Underwriter-only restrictions for SecureInsure Pro. This phase establishes role hierarchies, permission management, access control rules, and audit logging to ensure secure access to sensitive underwriting features.

## Key Features Implemented

### 1. Role-Based Access Control (RBAC)

#### Defined Roles
- **CUSTOMER**: Basic policy viewing and claim submission
- **AGENT**: Customer policy management and application submission
- **CASE_MANAGER**: Case management and basic policy approval
- **UNDERWRITER**: Risk assessment, premium rate setting, and complex policy approval
- **ADMIN**: Full system access and user management

#### Permission System
- Granular permissions for each role
- Permission inheritance through role hierarchy
- Feature-specific access control
- API endpoint protection

### 2. Underwriter-Only Restrictions

#### Restricted Features
- Premium Rate Calculator
- Risk Assessment Panel
- Underwriting Rules Editor
- Complex Policy Approval
- Risk Profile Analysis

#### Restricted Actions
- Setting premium rates
- Risk assessment
- Overriding underwriting rules
- Approving complex policies
- Viewing underwriting reports

### 3. Access Control Implementation

#### Route Protection
- `/underwriting` - UNDERWRITER, ADMIN only
- `/admin` - ADMIN only
- `/audit` - ADMIN with VIEW_AUDIT_LOGS permission

#### Component Protection
- Dynamic component rendering based on user roles
- Conditional UI elements
- Feature-specific access checks

#### API Protection
- Enhanced API interceptors
- 403 Forbidden handling
- Unauthorized access logging

### 4. Audit and Logging System

#### Access Logging
- All access attempts logged
- Unauthorized access tracking
- User action auditing
- IP address and user agent tracking

#### Underwriting Actions
- Risk assessment decisions
- Premium rate changes
- Rule overrides
- Policy approvals

#### Role Changes
- User role assignments
- Permission modifications
- Admin action tracking

## Technical Implementation

### 1. Core RBAC Configuration (`frontend/src/config/roles.ts`)

```typescript
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  AGENT: 'AGENT', 
  CASE_MANAGER: 'CASE_MANAGER',
  UNDERWRITER: 'UNDERWRITER',
  ADMIN: 'ADMIN'
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.UNDERWRITER]: [
    PERMISSIONS.UNDERWRITE_POLICIES,
    PERMISSIONS.APPROVE_COMPLEX_POLICIES,
    PERMISSIONS.SET_PREMIUM_RATES,
    PERMISSIONS.ASSESS_RISK,
    // ... more permissions
  ]
};
```

### 2. Access Control Hook (`frontend/src/hooks/useAccessControl.ts`)

```typescript
export const useAccessControl = () => {
  // Role checks
  const hasRole = (role: Role): boolean => hasRoleCheck(userRoles, role);
  const canUnderwrite = (): boolean => hasAnyRoleCheck([ROLES.UNDERWRITER, ROLES.ADMIN]);
  
  // Feature access checks
  const canAccessFeature = (feature: string): boolean => 
    canAccessFeature(userRoles, userPermissions, feature);
    
  return {
    hasRole,
    canUnderwrite,
    canAccessFeature,
    // ... more methods
  };
};
```

### 3. Enhanced Protected Route (`frontend/src/components/auth/ProtectedRoute.tsx`)

```typescript
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [], 
  requiredFeatures = [],
  showAccessDenied = true,
  redirectTo
}) => {
  // Multi-level access control
  // Permission checks
  // Role checks
  // Feature checks
  // Custom access denied UI
};
```

### 4. Audit Service (`frontend/src/services/auditService.ts`)

```typescript
export const auditService = {
  async logAccessAttempt(accessData: AccessAttempt): Promise<AuditLog>,
  async logUnauthorizedAccess(accessData: Omit<AccessAttempt, 'accessGranted'>): Promise<AuditLog>,
  async logUnderwritingAction(underwritingData: Omit<UnderwritingAudit, 'id' | 'timestamp'>): Promise<UnderwritingAudit>,
  // ... more methods
};
```

### 5. Enhanced API Interceptors (`frontend/src/services/api.ts`)

```typescript
// Response interceptor for 403 handling
api.interceptors.response.use(
  (response) => { /* success logging */ },
  async (error: AxiosError) => {
    if (error.response?.status === 403) {
      // Log unauthorized access
      // Show user-friendly error
      // Redirect if needed
    }
  }
);
```

## UI Components

### 1. Underwriting Dashboard (`frontend/src/components/Underwriting/UnderwritingDashboard.tsx`)

- **Overview Tab**: Summary statistics and recent activity
- **Risk Assessment Tab**: Pending assessments with approve/reject actions
- **Premium Rates Tab**: Rate management with increase/decrease controls
- **Rules Tab**: Underwriting rules with override capabilities

### 2. Audit Dashboard (`frontend/src/components/AdminPanel/AuditDashboard.tsx`)

- **Access Logs Tab**: System access attempts and API calls
- **Role Changes Tab**: User role modifications
- **Underwriting Tab**: Underwriting action logs
- **Export Functionality**: CSV export with filtering

## Access Control Rules

### Route Access
```typescript
export const ACCESS_RULES = {
  ROUTE_ACCESS: {
    '/underwriting': [ROLES.UNDERWRITER, ROLES.ADMIN],
    '/admin': [ROLES.ADMIN],
    '/audit': [ROLES.ADMIN]
  }
};
```

### Component Access
```typescript
COMPONENT_ACCESS: {
  'PremiumCalculator': [ROLES.UNDERWRITER, ROLES.ADMIN],
  'RiskAssessment': [ROLES.UNDERWRITER, ROLES.ADMIN],
  'UserManagement': [ROLES.ADMIN]
}
```

### API Access
```typescript
API_ACCESS: {
  'POST:/api/underwriting/assess-risk': [ROLES.UNDERWRITER, ROLES.ADMIN],
  'POST:/api/admin/users': [ROLES.ADMIN]
}
```

## Security Features

### 1. Multi-Level Access Control
- Role-based access
- Permission-based access
- Feature-based access
- Route-level protection

### 2. Comprehensive Auditing
- Access attempt logging
- Unauthorized access tracking
- User action monitoring
- Export capabilities

### 3. Error Handling
- 403 Forbidden responses
- User-friendly error messages
- Graceful degradation
- Audit trail maintenance

### 4. Session Management
- JWT token handling
- Refresh token logic
- Automatic logout on unauthorized access
- Role-based navigation filtering

## Usage Examples

### 1. Protecting a Component
```typescript
import { useAccessControl } from '../hooks/useAccessControl';

const MyComponent = () => {
  const accessControl = useAccessControl();
  
  if (!accessControl.canUnderwrite()) {
    return <AccessDenied message="Underwriter access required" />;
  }
  
  return <UnderwritingFeature />;
};
```

### 2. Protecting a Route
```typescript
<Route 
  path="/underwriting" 
  element={
    <ProtectedRoute 
      requiredRoles={['UNDERWRITER', 'ADMIN']}
      requiredFeatures={['PremiumCalculator']}
    >
      <UnderwritingDashboard />
    </ProtectedRoute>
  } 
/>
```

### 3. API Access Control
```typescript
const handlePremiumRateUpdate = async (rateId: string, newRate: number) => {
  if (!accessControl.canSetPremiumRates()) {
    toast.error('You do not have permission to set premium rates');
    return;
  }
  
  // Proceed with API call
};
```

## Testing and Validation

### 1. Access Control Testing
- Role-based access verification
- Permission-based access verification
- Feature-based access verification
- Unauthorized access handling

### 2. Audit Logging Testing
- Access attempt logging
- Unauthorized access logging
- Underwriting action logging
- Export functionality

### 3. UI Component Testing
- Conditional rendering based on roles
- Access denied displays
- Feature restriction messaging
- Navigation filtering

## Configuration

### Environment Variables
```bash
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Role Assignment
Users can be assigned multiple roles through the admin interface:
- Primary role determines main permissions
- Secondary roles provide additional access
- Role hierarchy ensures proper permission inheritance

### Permission Management
- Permissions are automatically assigned based on roles
- Custom permission overrides available for admins
- Permission changes are logged and audited

## Monitoring and Maintenance

### 1. Audit Log Review
- Regular review of access logs
- Monitoring unauthorized access attempts
- Tracking role and permission changes
- Export logs for compliance

### 2. Role Management
- Periodic role review and cleanup
- Permission audit and validation
- User access review
- Role hierarchy maintenance

### 3. Security Monitoring
- Failed access attempt monitoring
- Unusual activity detection
- Role escalation monitoring
- API access pattern analysis

## Future Enhancements

### 1. Advanced RBAC Features
- Dynamic role creation
- Time-based permissions
- Context-aware access control
- Risk-based access decisions

### 2. Enhanced Auditing
- Real-time audit alerts
- Machine learning anomaly detection
- Compliance reporting
- Integration with SIEM systems

### 3. Access Control Improvements
- Multi-factor authentication integration
- IP-based access restrictions
- Device-based access control
- Behavioral analysis

## Compliance and Security

### 1. Regulatory Compliance
- SOX compliance for financial systems
- HIPAA compliance for health data
- GDPR compliance for user data
- Industry-specific regulations

### 2. Security Best Practices
- Principle of least privilege
- Role-based access control
- Comprehensive audit logging
- Secure session management

### 3. Risk Mitigation
- Unauthorized access prevention
- Data breach detection
- Insider threat monitoring
- Compliance violation prevention

## Conclusion

Phase 6 successfully implements a comprehensive RBAC system that:

1. **Secures sensitive underwriting features** with role-based access control
2. **Provides granular permission management** for different user types
3. **Implements comprehensive auditing** for compliance and security
4. **Ensures graceful error handling** for unauthorized access attempts
5. **Maintains user experience** while enforcing security policies

The implementation follows security best practices and provides a solid foundation for future security enhancements and compliance requirements. 