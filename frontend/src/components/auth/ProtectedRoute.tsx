import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessControl } from '../../hooks/useAccessControl';


interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  requiredFeatures?: string[];
  showAccessDenied?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [], 
  requiredFeatures = [],
  showAccessDenied = true,
  redirectTo
}) => {
  const { state } = useAuth();
  const accessControl = useAccessControl();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = accessControl.hasAllPermissions(requiredPermissions as any);
    
    if (!hasAllPermissions) {
      if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
      }
      
      if (showAccessDenied) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                You don't have the required permissions to access this page.
              </p>
              <div className="text-sm text-gray-500">
                <p>Required permissions:</p>
                <ul className="list-disc list-inside mt-1">
                  {requiredPermissions.map(permission => (
                    <li key={permission}>{permission}</li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
      
      return null;
    }
  }

  // Check required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = accessControl.hasAnyRole(requiredRoles as any);
    
    if (!hasRequiredRole) {
      if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
      }
      
      if (showAccessDenied) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                You don't have the required role to access this page.
              </p>
              <div className="text-sm text-gray-500">
                <p>Required roles:</p>
                <ul className="list-disc list-inside mt-1">
                  {requiredRoles.map(role => (
                    <li key={role}>{role.replace('_', ' ')}</li>
                  ))}
                </ul>
                <p className="mt-2">Your roles: {accessControl.userRoles.join(', ') || 'None'}</p>
              </div>
              <button 
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
      
      return null;
    }
  }

  // Check required features (for underwriter-only features)
  if (requiredFeatures.length > 0) {
    const hasAllFeatures = requiredFeatures.every(feature => 
      accessControl.canAccessFeature(feature)
    );
    
    if (!hasAllFeatures) {
      if (redirectTo) {
        return <Navigate to={redirectTo} replace />;
      }
      
      if (showAccessDenied) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-yellow-600 mb-2">Feature Restricted</h1>
              <p className="text-gray-600 mb-4">
                This feature is restricted to underwriters only.
              </p>
              <div className="text-sm text-gray-500">
                <p>Required features:</p>
                <ul className="list-disc list-inside mt-1">
                  {requiredFeatures.map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <p className="mt-2">
                  Your role: {accessControl.getUserRoleInfo().displayName}
                </p>
              </div>
              <button 
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        );
      }
      
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 