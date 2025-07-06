import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GraduationCap, Building, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { classApi, organizationApi } from '../../lib/api';
import { Class, Organization } from '../../types';
import { ClassForm } from './ClassForm';

export function ClassList() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, orgsData] = await Promise.all([
        classApi.getAll(),
        organizationApi.getAll()
      ]);
      setClasses(classesData);
      setOrganizations(orgsData);
      setError(null);
    } catch (err) {
      setError('Failed to load classes and organizations');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    
    try {
      await classApi.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete class');
      console.error('Error deleting class:', err);
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingClass(null);
    await loadData();
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingClass(null);
    setShowForm(true);
  };

  const getOrganizationName = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    return org?.name || 'Unknown Organization';
  };

  const filteredClasses = selectedOrgId 
    ? classes.filter(cls => cls.organization_id === selectedOrgId)
    : classes;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Classes</h2>
          <p className="text-muted-foreground">Manage classes and their details</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Organization Filter */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <div className="mb-6">
          <ClassForm
            class={editingClass}
            organizations={organizations}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingClass(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedOrgId ? 'No Classes in Selected Organization' : 'No Classes'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedOrgId 
                    ? 'This organization doesn\'t have any classes yet.' 
                    : 'Get started by creating your first class.'
                  }
                </p>
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Class
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredClasses.map((cls) => (
            <Card key={cls.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {getOrganizationName(cls.organization_id)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cls)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(cls.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cls.subject && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Subject:</span>
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                        {cls.subject}
                      </span>
                    </div>
                  )}
                  {cls.grade_level && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Grade:</span>
                      <span className="bg-secondary/50 px-2 py-1 rounded text-xs">
                        {cls.grade_level}
                      </span>
                    </div>
                  )}
                  {cls.room_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Room:</span>
                      <span>{cls.room_number}</span>
                    </div>
                  )}
                  {cls.description && (
                    <div className="text-sm text-muted-foreground mt-2">
                      {cls.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {new Date(cls.created_at).toLocaleDateString()}
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