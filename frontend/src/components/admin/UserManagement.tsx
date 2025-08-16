import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  ShieldCheckIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../components/ui/dropdown-menu';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@secureinsure.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        permissions: ['ADMIN_ACCESS', 'USER_MANAGEMENT', 'SYSTEM_CONFIG']
      },
      {
        id: '2',
        username: 'underwriter1',
        email: 'underwriter1@secureinsure.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'UNDERWRITER',
        status: 'active',
        lastLogin: '2024-01-15T09:15:00Z',
        createdAt: '2024-01-05T00:00:00Z',
        permissions: ['CASE_REVIEW', 'UNDERWRITING_DECISIONS', 'POLICY_APPROVAL']
      },
      {
        id: '3',
        username: 'agent1',
        email: 'agent1@secureinsure.com',
        firstName: 'Michael',
        lastName: 'Smith',
        role: 'AGENT',
        status: 'active',
        lastLogin: '2024-01-14T16:45:00Z',
        createdAt: '2024-01-10T00:00:00Z',
        permissions: ['CASE_CREATION', 'CUSTOMER_MANAGEMENT', 'POLICY_SUBMISSION']
      },
      {
        id: '4',
        username: 'casemanager1',
        email: 'casemanager1@secureinsure.com',
        firstName: 'Lisa',
        lastName: 'Davis',
        role: 'CASE_MANAGER',
        status: 'active',
        lastLogin: '2024-01-15T08:20:00Z',
        createdAt: '2024-01-12T00:00:00Z',
        permissions: ['CASE_MANAGEMENT', 'WORKFLOW_ORCHESTRATION', 'DOCUMENT_REVIEW']
      }
    ];

    const mockRoles: Role[] = [
      {
        id: '1',
        name: 'ADMIN',
        description: 'Full system access and configuration',
        permissions: ['ADMIN_ACCESS', 'USER_MANAGEMENT', 'SYSTEM_CONFIG'],
        userCount: 1
      },
      {
        id: '2',
        name: 'UNDERWRITER',
        description: 'Underwriting decisions and policy approval',
        permissions: ['CASE_REVIEW', 'UNDERWRITING_DECISIONS', 'POLICY_APPROVAL'],
        userCount: 1
      },
      {
        id: '3',
        name: 'AGENT',
        description: 'Case creation and customer management',
        permissions: ['CASE_CREATION', 'CUSTOMER_MANAGEMENT', 'POLICY_SUBMISSION'],
        userCount: 1
      },
      {
        id: '4',
        name: 'CASE_MANAGER',
        description: 'Case workflow and document management',
        permissions: ['CASE_MANAGEMENT', 'WORKFLOW_ORCHESTRATION', 'DOCUMENT_REVIEW'],
        userCount: 1
      }
    ];

    setUsers(mockUsers);
    setRoles(mockRoles);
  }, []);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      'active': { color: 'bg-green-100 text-green-800', text: 'Active' },
      'inactive': { color: 'bg-gray-100 text-gray-800', text: 'Inactive' },
      'suspended': { color: 'bg-red-100 text-red-800', text: 'Suspended' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: 'Unknown' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { color: string }> = {
      'ADMIN': { color: 'bg-red-100 text-red-800' },
      'UNDERWRITER': { color: 'bg-purple-100 text-purple-800' },
      'AGENT': { color: 'bg-blue-100 text-blue-800' },
      'CASE_MANAGER': { color: 'bg-green-100 text-green-800' }
    };
    
    const config = roleConfig[role] || { color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {role}
      </Badge>
    );
  };

  const handleUserAction = (action: string, user: User) => {
    switch (action) {
      case 'view':
        setEditingUser(user);
        setShowUserModal(true);
        break;
      case 'edit':
        setEditingUser(user);
        setShowUserModal(true);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete user ${user.username}?`)) {
          setUsers(prev => prev.filter(u => u.id !== user.id));
          toast.success('User deleted successfully');
        }
        break;
      default:
        break;
    }
  };

  const handleRoleAction = (action: string, role: Role) => {
    switch (action) {
      case 'view':
        setEditingRole(role);
        setShowRoleModal(true);
        break;
      case 'edit':
        setEditingRole(role);
        setShowRoleModal(true);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete role ${role.name}?`)) {
          setRoles(prev => prev.filter(r => r.id !== role.id));
          toast.success('Role deleted successfully');
        }
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage system users, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowRoleModal(true)} variant="outline">
            <ShieldCheckIcon className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
          <Button onClick={() => setShowUserModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by username, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.firstName} {user.lastName}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                    <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <FunnelIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUserAction('view', user)}>
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction('edit', user)}>
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('delete', user)}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5" />
            System Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{role.name}</h3>
                  <Badge variant="outline">{role.userCount} users</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {role.permissions.slice(0, 3).map((permission, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleAction('view', role)}
                    className="flex-1"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleAction('edit', role)}
                    className="flex-1"
                  >
                    <PencilIcon className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Modal Placeholder */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                }}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                {editingUser 
                  ? `Edit user: ${editingUser.username}`
                  : 'Create a new system user with appropriate role and permissions.'
                }
              </p>
              
              {/* Form fields would go here in a real implementation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <Input 
                    placeholder="Enter username"
                    defaultValue={editingUser?.username || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input 
                    type="email"
                    placeholder="Enter email"
                    defaultValue={editingUser?.email || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <Input 
                    placeholder="Enter first name"
                    defaultValue={editingUser?.firstName || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <Input 
                    placeholder="Enter last name"
                    defaultValue={editingUser?.lastName || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
                  setShowUserModal(false);
                  setEditingUser(null);
                }}>
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal Placeholder */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingRole ? 'Edit Role' : 'Manage Roles'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRoleModal(false);
                  setEditingRole(null);
                }}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                {editingRole 
                  ? `Edit role: ${editingRole.name}`
                  : 'Manage system roles and their associated permissions.'
                }
              </p>
              
              {/* Role management interface would go here in a real implementation */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                  <Input 
                    placeholder="Enter role name"
                    defaultValue={editingRole?.name || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input 
                    placeholder="Enter role description"
                    defaultValue={editingRole?.description || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                    {['ADMIN_ACCESS', 'USER_MANAGEMENT', 'SYSTEM_CONFIG', 'CASE_REVIEW', 'UNDERWRITING_DECISIONS', 'POLICY_APPROVAL', 'CASE_CREATION', 'CUSTOMER_MANAGEMENT', 'POLICY_SUBMISSION', 'CASE_MANAGEMENT', 'WORKFLOW_ORCHESTRATION', 'DOCUMENT_REVIEW'].map(permission => (
                      <label key={permission} className="flex items-center space-x-2 mb-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRoleModal(false);
                    setEditingRole(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success(editingRole ? 'Role updated successfully' : 'Role created successfully');
                  setShowRoleModal(false);
                  setEditingRole(null);
                }}>
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 