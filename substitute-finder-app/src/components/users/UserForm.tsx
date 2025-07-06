import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { userApi } from '../../lib/api';
import { User, Organization, CreateUserRequest } from '../../types';

interface UserFormProps {
  user?: User | null;
  organizations: Organization[];
  onSubmit: () => void;
  onCancel: () => void;
}

export function UserForm({ user: editUser, organizations, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: editUser?.username || '',
    password: '',
    email: editUser?.email || '',
    first_name: editUser?.first_name || '',
    last_name: editUser?.last_name || '',
    role: editUser?.role || 'substitute',
    organization_id: editUser?.organization_id || undefined,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editUser) {
        // For editing, we would need an update user command
        // For now, we'll just show a message
        setError('User editing is not yet implemented. Please create a new user instead.');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        organization_id: formData.organization_id || undefined,
      };

      await userApi.create(submitData);
      onSubmit();
    } catch (err) {
      setError(`Failed to ${editUser ? 'update' : 'create'} user`);
      console.error('Error submitting user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'role' ? value as any : value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editUser ? 'Edit User' : 'Create New User'}
        </CardTitle>
        <CardDescription>
          {editUser 
            ? 'Update the user details below.' 
            : 'Fill in the details to create a new user account.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium">
                First Name *
              </label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium">
                Last Name *
              </label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username *
              </label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                placeholder="Enter username"
                required
                disabled={!!editUser}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            {!editUser && (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password *
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter password"
                  required={!editUser}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="substitute">Substitute Teacher</option>
                <option value="org_manager">Organization Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="organization" className="text-sm font-medium">
                Organization
              </label>
              <select
                id="organization"
                value={formData.organization_id || ''}
                onChange={(e) => handleChange('organization_id', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">No Organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Role Permissions:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div><strong>Administrator:</strong> Full system access, can manage all organizations and users</div>
              <div><strong>Organization Manager:</strong> Can manage classes and users within their organization</div>
              <div><strong>Substitute Teacher:</strong> Can view and respond to substitute requests</div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (editUser ? 'Updating...' : 'Creating...') 
                : (editUser ? 'Update User' : 'Create User')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}