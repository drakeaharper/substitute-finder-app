import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Shield, User as UserIcon, Building } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { userApi, organizationApi } from '../../lib/api';
import { User, Organization } from '../../types';
import { UserForm } from './UserForm';

interface UserListProps {
  currentUser: User;
}

export function UserList({ currentUser }: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, orgsData] = await Promise.all([
        userApi.getAll(),
        organizationApi.getAll()
      ]);
      setUsers(usersData);
      setOrganizations(orgsData);
      setError(null);
    } catch (err) {
      setError('Failed to load users and organizations');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingUser(null);
    await loadData();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const getOrganizationName = (orgId?: string) => {
    if (!orgId) return 'No Organization';
    const org = organizations.find(o => o.id === orgId);
    return org?.name || 'Unknown Organization';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'org_manager':
        return <Building className="w-4 h-4 text-blue-500" />;
      case 'substitute':
        return <UserIcon className="w-4 h-4 text-green-500" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'org_manager':
        return 'Organization Manager';
      case 'substitute':
        return 'Substitute Teacher';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'org_manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'substitute':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = selectedRole 
    ? users.filter(user => user.role === selectedRole)
    : users;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Users</h2>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        {currentUser.role === 'admin' && (
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Role Filter */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="org_manager">Organization Managers</option>
              <option value="substitute">Substitute Teachers</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {showForm && currentUser.role === 'admin' && (
        <div className="mb-6">
          <UserForm
            user={editingUser}
            organizations={organizations}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingUser(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedRole ? 'No Users with Selected Role' : 'No Users'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedRole 
                    ? 'No users found with the selected role.' 
                    : 'Get started by creating your first user account.'
                  }
                </p>
                {currentUser.role === 'admin' && (
                  <Button onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {user.first_name} {user.last_name}
                      </CardTitle>
                      <CardDescription>@{user.username}</CardDescription>
                    </div>
                  </div>
                  {currentUser.role === 'admin' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground">Email:</div>
                    <div>{user.email}</div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium text-muted-foreground">Organization:</div>
                    <div className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {getOrganizationName(user.organization_id)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>
                      Status: {user.is_active ? (
                        <span className="text-green-600 font-medium">Active</span>
                      ) : (
                        <span className="text-red-600 font-medium">Inactive</span>
                      )}
                    </span>
                    <span>
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}