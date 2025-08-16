import React from 'react';
import { NavLink } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useAccessControl } from '../../hooks/useAccessControl';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { state, hasPermission } = useAuth();
  const accessControl = useAccessControl();

  const navigation: Array<{
    name: string;
    href: string;
    icon: string;
    permission?: string;
    requiredRoles?: string[];
    requiredFeatures?: string[];
    requiredPermissions?: string[];
    description?: string;
  }> = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      name: 'Policies',
      href: '/policies',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      permission: 'POLICY_READ',
    },
    {
      name: 'Claims',
      href: '/claims',
      icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      permission: 'CLAIM_READ',
    },
    {
      name: 'Search',
      href: '/search',
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    },
    {
      name: 'Chatbot',
      href: '/chatbot',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    },
    // Underwriting - Restricted to UNDERWRITER and ADMIN roles
    {
      name: 'Underwriting',
      href: '/underwriting',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      requiredRoles: ['UNDERWRITER', 'ADMIN'],
      requiredFeatures: ['PremiumCalculator', 'RiskAssessment'],
      description: 'Risk assessment and premium rates'
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      requiredRoles: ['ADMIN'],
      description: 'System administration'
    },
    // Audit - Restricted to ADMIN role with specific permission
    {
      name: 'Audit',
      href: '/audit',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      requiredRoles: ['ADMIN'],
      requiredPermissions: ['VIEW_AUDIT_LOGS'],
      description: 'Access logs and audit trails'
    },
  ];

  const filteredNavigation = navigation.filter(item => {
    // Check permission-based access
    if (item.permission) {
      return hasPermission(item.permission);
    }
    
    // Check role-based access
    if (item.requiredRoles) {
      return accessControl.hasAnyRole(item.requiredRoles as any);
    }
    
    // Check feature-based access
    if (item.requiredFeatures) {
      return item.requiredFeatures.every(feature => 
        accessControl.canAccessFeature(feature)
      );
    }
    
    // Check permission-based access for specific permissions
    if (item.requiredPermissions) {
      return accessControl.hasAllPermissions(item.requiredPermissions as any);
    }
    
    // No restrictions
    return true;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                SecureInsure
              </h2>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-5 px-2 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
              onClick={() => setOpen(false)}
            >
              <svg
                className="mr-3 h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              <div className="flex-1">
                <span>{item.name}</span>
                {item.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            </NavLink>
          ))}
        </nav>

        {/* User Role Information */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">
              {state.user?.fullName || 'User'}
            </p>
            <p className="text-xs">
              {accessControl.getUserRoleInfo().displayName}
            </p>
            {accessControl.getUserRoleInfo().isMultiRole && (
              <p className="text-xs text-gray-500">
                +{accessControl.getUserRoleInfo().roleCount - 1} more roles
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 