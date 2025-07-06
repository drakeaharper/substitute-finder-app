import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { organizationApi } from '../../lib/api';
import { Organization, CreateOrganizationRequest } from '../../types';

interface OrganizationFormProps {
  organization?: Organization | null;
  organizations: Organization[];
  onSubmit: () => void;
  onCancel: () => void;
}

export function OrganizationForm({ organization, organizations, onSubmit, onCancel }: OrganizationFormProps) {
  const [formData, setFormData] = useState<CreateOrganizationRequest>({
    name: organization?.name || '',
    parent_organization_id: organization?.parent_organization_id || '',
    description: organization?.description || '',
    contact_email: organization?.contact_email || '',
    contact_phone: organization?.contact_phone || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        parent_organization_id: formData.parent_organization_id || undefined,
        description: formData.description || undefined,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
      };

      if (organization) {
        await organizationApi.update(organization.id, submitData);
      } else {
        await organizationApi.create(submitData);
      }
      
      onSubmit();
    } catch (err) {
      setError(`Failed to ${organization ? 'update' : 'create'} organization`);
      console.error('Error submitting organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateOrganizationRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter out the current organization from parent options to prevent circular references
  const availableParents = organizations.filter(org => org.id !== organization?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {organization ? 'Edit Organization' : 'Create New Organization'}
        </CardTitle>
        <CardDescription>
          {organization 
            ? 'Update the organization details below.' 
            : 'Fill in the details to create a new organization.'
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
              <label htmlFor="name" className="text-sm font-medium">
                Organization Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="parent" className="text-sm font-medium">
                Parent Organization
              </label>
              <select
                id="parent"
                value={formData.parent_organization_id || ''}
                onChange={(e) => handleChange('parent_organization_id', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select parent organization (optional)</option>
                {availableParents.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Contact Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="contact@organization.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Contact Phone
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.contact_phone || ''}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Organization description (optional)"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
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
                ? (organization ? 'Updating...' : 'Creating...') 
                : (organization ? 'Update Organization' : 'Create Organization')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}