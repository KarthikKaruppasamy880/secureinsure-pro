import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

const roleSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  isActive: z.boolean().default(true),
});

const userRoleSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  roleId: z.string().min(1, 'Role is required'),
});

type RoleFormData = z.infer<typeof roleSchema>;
type UserRoleFormData = z.infer<typeof userRoleSchema>;

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface RoleManagementProps {
  roles: Role[];
  users: User[];
  permissions: Permission[];
  onCreateRole: (data: RoleFormData) => Promise<void>;
  onUpdateRole: (id: string, data: RoleFormData) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
  onAssignRole: (data: UserRoleFormData) => Promise<void>;
  onRemoveRole: (userId: string, roleId: string) => Promise<void>;
  onToggleRoleStatus: (id: string, isActive: boolean) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export default function RoleManagement({
  roles,
  users,
  permissions,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
  onAssignRole,
  onRemoveRole,
  onToggleRoleStatus,
  isLoading = false,
  error
}: RoleManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const roleForm = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
      isActive: true,
    },
  });

  const userRoleForm = useForm<UserRoleFormData>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      userId: '',
      roleId: '',
    },
  });

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && role.isActive) ||
                         (statusFilter === 'inactive' && !role.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleCreateRole = async (data: RoleFormData) => {
    try {
      await onCreateRole(data);
      setIsCreateDialogOpen(false);
      roleForm.reset();
      toast.success('Role created successfully!');
    } catch (err) {
      toast.error('Failed to create role. Please try again.');
    }
  };

  const handleUpdateRole = async (data: RoleFormData) => {
    if (!selectedRole) return;
    try {
      await onUpdateRole(selectedRole.id, data);
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      roleForm.reset();
      toast.success('Role updated successfully!');
    } catch (err) {
      toast.error('Failed to update role. Please try again.');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await onDeleteRole(roleId);
      toast.success('Role deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete role. Please try again.');
    }
  };

  const handleAssignRole = async (data: UserRoleFormData) => {
    try {
      await onAssignRole(data);
      setIsAssignDialogOpen(false);
      userRoleForm.reset();
      toast.success('Role assigned successfully!');
    } catch (err) {
      toast.error('Failed to assign role. Please try again.');
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    roleForm.reset({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getPermissionCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'policy':
        return 'bg-green-100 text-green-800';
      case 'claims':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Roles ({filteredRoles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.userCount} users</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(role.isActive)}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(role.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleRoleStatus(role.id, !role.isActive)}
                      >
                        {role.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the role &quot;{role.name}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteRole(role.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Role
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={roleForm.handleSubmit(handleCreateRole)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roleName">Role Name</Label>
              <Input
                id="roleName"
                {...roleForm.register('name')}
                placeholder="Enter role name"
              />
              {roleForm.formState.errors.name && (
                <p className="text-sm text-red-600">{roleForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleDescription">Description</Label>
              <Input
                id="roleDescription"
                {...roleForm.register('description')}
                placeholder="Enter role description"
              />
              {roleForm.formState.errors.description && (
                <p className="text-sm text-red-600">{roleForm.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((permission) => (
                        <label key={permission.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={permission.name}
                            {...roleForm.register('permissions')}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {roleForm.formState.errors.permissions && (
                <p className="text-sm text-red-600">{roleForm.formState.errors.permissions.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                {...roleForm.register('isActive')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Role
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Role
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={roleForm.handleSubmit(handleUpdateRole)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editRoleName">Role Name</Label>
              <Input
                id="editRoleName"
                {...roleForm.register('name')}
                placeholder="Enter role name"
              />
              {roleForm.formState.errors.name && (
                <p className="text-sm text-red-600">{roleForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRoleDescription">Description</Label>
              <Input
                id="editRoleDescription"
                {...roleForm.register('description')}
                placeholder="Enter role description"
              />
              {roleForm.formState.errors.description && (
                <p className="text-sm text-red-600">{roleForm.formState.errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((permission) => (
                        <label key={permission.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={permission.name}
                            {...roleForm.register('permissions')}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {roleForm.formState.errors.permissions && (
                <p className="text-sm text-red-600">{roleForm.formState.errors.permissions.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                {...roleForm.register('isActive')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="editIsActive">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Update Role
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Assign Role to User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={userRoleForm.handleSubmit(handleAssignRole)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User</Label>
              <Select {...userRoleForm.register('userId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userRoleForm.formState.errors.userId && (
                <p className="text-sm text-red-600">{userRoleForm.formState.errors.userId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Role</Label>
              <Select {...userRoleForm.register('roleId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(role => role.isActive).map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userRoleForm.formState.errors.roleId && (
                <p className="text-sm text-red-600">{userRoleForm.formState.errors.roleId.message}</p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Assign Role
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 