import React from 'react';
import { NavLink } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { 
  Home, 
  FileText, 
  Shield, 
  Search, 
  MessageSquare, 
  User, 
  Bell, 
  CheckCircle, 
  Settings, 
  FileText as Clipboard,
  FileSpreadsheet
} from 'lucide-react';
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
      icon: 'Home',
    },
    {
      name: 'Policies',
      href: '/policies',
      icon: 'FileText',
      permission: 'POLICY_READ',
    },
    {
      name: 'Claims',
      href: '/claims',
      icon: 'Shield',
      permission: 'CLAIM_READ',
    },
    {
      name: 'Search',
      href: '/search',
      icon: 'Search',
    },
    {
      name: 'Chatbot',
      href: '/chatbot',
      icon: 'MessageSquare',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: 'User',
      description: 'Account settings & biometrics'
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: 'Bell',
      description: 'Manage notifications & alerts'
    },
    // Underwriting - Restricted to UNDERWRITER and ADMIN roles
    {
      name: 'Underwriting',
      href: '/underwriting',
      icon: 'CheckCircle',
      requiredRoles: ['UNDERWRITER', 'ADMIN'],
      requiredFeatures: ['PremiumCalculator', 'RiskAssessment'],
      description: 'Risk assessment and premium rates'
    },

    {
      name: 'Create Case',
      href: '/create-case',
      icon: 'FileText',
      description: 'Create new insurance case with dynamic forms'
    },
    {
      name: 'Admin',
      href: '/admin',
      icon: 'Settings',
      requiredRoles: ['ADMIN'],
      description: 'System administration'
    },
    // Audit - Restricted to ADMIN role with specific permission
    {
      name: 'Audit',
      href: '/audit',
      icon: 'Clipboard',
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
              {(() => {
                const iconMap: Record<string, any> = {
                  Home,
                  FileText,
                  Shield,
                  Search,
                  MessageSquare,
                  User,
                  Bell,
                  CheckCircle,
                  Settings,
                  Clipboard,
                  FileSpreadsheet
                };
                
                const IconComponent = iconMap[item.icon];
                
                return IconComponent ? (
                  <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                ) : (
                  <div className="mr-3 h-5 w-5 flex-shrink-0 bg-gray-300 rounded" />
                );
              })()}
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