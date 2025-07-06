import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { organizationApi } from '../../lib/api';
import { Organization } from '../../types';
import { OrganizationForm } from './OrganizationForm';

export function OrganizationList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationApi.getAll();
      setOrganizations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load organizations');
      console.error('Error loading organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;
    
    try {
      await organizationApi.delete(id);
      await loadOrganizations();
    } catch (err) {
      setError('Failed to delete organization');
      console.error('Error deleting organization:', err);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingOrg(null);
    await loadOrganizations();
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingOrg(null);
    setShowForm(true);
  };

  const buildOrganizationTree = (orgs: Organization[]) => {
    const orgMap = new Map<string, Organization & { children: Organization[] }>();
    
    // Create map with children arrays
    orgs.forEach(org => {
      orgMap.set(org.id, { ...org, children: [] });
    });
    
    // Build tree structure
    const rootOrgs: (Organization & { children: Organization[] })[] = [];
    orgs.forEach(org => {
      const orgWithChildren = orgMap.get(org.id)!;
      if (org.parent_organization_id) {
        const parent = orgMap.get(org.parent_organization_id);
        if (parent) {
          parent.children.push(orgWithChildren);
        }
      } else {
        rootOrgs.push(orgWithChildren);
      }
    });
    
    return rootOrgs;
  };

  const renderOrganizationTree = (orgs: (Organization & { children: Organization[] })[], depth = 0) => {
    return orgs.map((org) => (
      <div key={org.id} className={`${depth > 0 ? 'ml-8' : ''}`}>
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                  {org.description && (
                    <CardDescription>{org.description}</CardDescription>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(org)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(org.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground space-y-1">
              {org.contact_email && (
                <div>Email: {org.contact_email}</div>
              )}
              {org.contact_phone && (
                <div>Phone: {org.contact_phone}</div>
              )}
              <div>Created: {new Date(org.created_at).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
        
        {org.children.length > 0 && (
          <div className="ml-4 border-l-2 border-border pl-4">
            {renderOrganizationTree(org.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Organizations</h2>
          <p className="text-muted-foreground">Manage your organizations and their hierarchy</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6">
          <OrganizationForm
            organization={editingOrg}
            organizations={organizations}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingOrg(null);
            }}
          />
        </div>
      )}

      <div className="space-y-4">
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Organizations</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first organization.
              </p>
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          renderOrganizationTree(buildOrganizationTree(organizations))
        )}
      </div>
    </div>
  );
}