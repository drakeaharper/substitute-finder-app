import React, { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, XCircle, Calendar, MapPin, User, Building, Check, X, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { substituteApi, classApi, organizationApi, userApi } from '../../lib/api';
import { SubstituteRequest, Class, Organization, User as UserType } from '../../types';
import { RequestForm } from './RequestForm';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { CSVExporter } from '../../lib/export';

export function RequestList() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [requests, setRequests] = useState<SubstituteRequest[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<SubstituteRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      let requestsData;
      
      // Use role-based filtering for requests
      if (user) {
        requestsData = await substituteApi.getForUser(user.id, user.role);
      } else {
        requestsData = await substituteApi.getAll();
      }
      
      const [classesData, orgsData, usersData] = await Promise.all([
        classApi.getAll(),
        organizationApi.getAll(),
        userApi.getAll()
      ]);
      
      setRequests(requestsData);
      setClasses(classesData);
      setOrganizations(orgsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError('Failed to load substitute requests');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this substitute request?')) return;
    
    try {
      await substituteApi.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete substitute request');
      console.error('Error deleting request:', err);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, substituteId?: string) => {
    try {
      await substituteApi.updateStatus(id, status, substituteId);
      await loadData();
    } catch (err) {
      setError('Failed to update request status');
      console.error('Error updating status:', err);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      await substituteApi.accept(requestId, user.id);
      addNotification({
        title: 'Request Accepted',
        body: 'You have successfully accepted this substitute request',
        notification_type: 'success'
      });
      await loadData();
    } catch (err) {
      setError('Failed to accept request');
      addNotification({
        title: 'Error',
        body: 'Failed to accept the substitute request',
        notification_type: 'error'
      });
      console.error('Error accepting request:', err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await substituteApi.decline(requestId);
      addNotification({
        title: 'Request Declined',
        body: 'You have declined this substitute request',
        notification_type: 'info'
      });
      await loadData();
    } catch (err) {
      setError('Failed to decline request');
      addNotification({
        title: 'Error',
        body: 'Failed to decline the substitute request',
        notification_type: 'error'
      });
      console.error('Error declining request:', err);
    }
  };

  const handleExportRequests = async () => {
    try {
      CSVExporter.exportSubstituteRequests(requests, classes, organizations, users);
      addNotification({
        title: 'Export Successful',
        body: 'Substitute requests have been exported to CSV',
        notification_type: 'success'
      });
    } catch (error) {
      console.error('Export failed:', error);
      addNotification({
        title: 'Export Failed',
        body: 'Failed to export substitute requests',
        notification_type: 'error'
      });
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingRequest(null);
    await loadData();
  };

  const handleAdd = () => {
    setEditingRequest(null);
    setShowForm(true);
  };

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls?.name || 'Unknown Class';
  };

  const getOrganizationName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return 'Unknown Organization';
    const org = organizations.find(o => o.id === cls.organization_id);
    return org?.name || 'Unknown Organization';
  };

  const getUserName = (userId: string) => {
    const userObj = users.find(u => u.id === userId);
    return userObj ? `${userObj.first_name} ${userObj.last_name}` : 'Unknown User';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'filled':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'filled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredRequests = statusFilter 
    ? requests.filter(req => req.status === statusFilter)
    : requests;

  const sortedRequests = filteredRequests.sort((a, b) => 
    new Date(a.date_needed).getTime() - new Date(b.date_needed).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading substitute requests...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">Substitute Requests</h2>
          <p className="text-muted-foreground">Manage substitute teacher requests and assignments</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportRequests}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          {(user?.role === 'admin' || user?.role === 'org_manager') && (
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Create Request
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">All Requests</option>
              <option value="open">Open Requests</option>
              <option value="filled">Filled Requests</option>
              <option value="cancelled">Cancelled Requests</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <div className="mb-6">
          <RequestForm
            request={editingRequest}
            classes={classes}
            users={users}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingRequest(null);
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedRequests.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {statusFilter ? 'No Requests with Selected Status' : 'No Substitute Requests'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {statusFilter 
                    ? 'No requests found with the selected status.' 
                    : 'Get started by creating your first substitute request.'
                  }
                </p>
                {(user?.role === 'admin' || user?.role === 'org_manager') && (
                  <Button onClick={handleAdd}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Request
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          sortedRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{getClassName(request.class_id)}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {getOrganizationName(request.class_id)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(request.date_needed)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{formatTime(request.start_time)} - {formatTime(request.end_time)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Requested by: {getUserName(request.requested_by)}</span>
                  </div>

                  {request.reason && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Reason:</span>
                      <p className="mt-1">{request.reason}</p>
                    </div>
                  )}

                  {request.special_instructions && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Special Instructions:</span>
                      <p className="mt-1">{request.special_instructions}</p>
                    </div>
                  )}

                  {request.assigned_substitute_id && (
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Assigned to:</span>
                      <p className="mt-1 text-green-700 font-medium">
                        {getUserName(request.assigned_substitute_id)}
                      </p>
                    </div>
                  )}

                  {request.status === 'open' && (user?.role === 'admin' || user?.role === 'org_manager') && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(request.id, 'filled')}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Filled
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(request.id, 'cancelled')}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}

                  {request.status === 'open' && user?.role === 'substitute' && !request.assigned_substitute_id && (
                    <div className="flex gap-2 pt-3 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  )}

                  {request.status === 'filled' && user?.role === 'substitute' && request.assigned_substitute_id === user.id && (
                    <div className="pt-3 border-t">
                      <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-md text-center">
                        <span className="text-sm font-medium text-green-800">
                          ✅ You have accepted this request
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {new Date(request.created_at).toLocaleDateString()}
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