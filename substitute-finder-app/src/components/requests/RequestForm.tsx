import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { substituteApi, notificationApi } from '../../lib/api';
import { SubstituteRequest, Class, CreateSubstituteRequestRequest, User as UserType } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

interface RequestFormProps {
  request?: SubstituteRequest | null;
  classes: Class[];
  users: UserType[];
  onSubmit: () => void;
  onCancel: () => void;
}

export function RequestForm({ request: editRequest, classes, users, onSubmit, onCancel }: RequestFormProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState<CreateSubstituteRequestRequest>({
    class_id: editRequest?.class_id || '',
    date_needed: editRequest?.date_needed || '',
    start_time: editRequest?.start_time || '08:00',
    end_time: editRequest?.end_time || '15:00',
    reason: editRequest?.reason || '',
    special_instructions: editRequest?.special_instructions || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        reason: formData.reason || undefined,
        special_instructions: formData.special_instructions || undefined,
      };

      if (editRequest) {
        // For now, we don't support editing requests
        setError('Editing requests is not yet implemented. Please create a new request instead.');
        setLoading(false);
        return;
      }

      const newRequest = await substituteApi.create(user.id, submitData);
      
      // Send notifications to substitute teachers
      try {
        const selectedClass = classes.find(cls => cls.id === submitData.class_id);
        const className = selectedClass ? selectedClass.name : 'Unknown Class';
        
        // Get all substitute teachers
        const substituteTeachers = users.filter(u => u.role === 'substitute');
        const substituteUserIds = substituteTeachers.map(u => u.id);
        
        if (substituteUserIds.length > 0) {
          await notificationApi.notifySubstituteRequestCreated(
            newRequest.id,
            className,
            submitData.date_needed,
            substituteUserIds
          );
          
          addNotification({
            title: 'Notifications Sent',
            body: `Notified ${substituteUserIds.length} substitute teachers about the new request`,
            notification_type: 'success'
          });
        } else {
          addNotification({
            title: 'No Substitutes Available',
            body: 'No substitute teachers found to notify',
            notification_type: 'warning'
          });
        }
      } catch (notificationError) {
        console.error('Failed to send notifications:', notificationError);
        addNotification({
          title: 'Notification Error',
          body: 'Request created but failed to notify substitutes',
          notification_type: 'warning'
        });
      }
      
      onSubmit();
    } catch (err) {
      setError(`Failed to ${editRequest ? 'update' : 'create'} substitute request`);
      console.error('Error submitting request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateSubstituteRequestRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter classes based on user's organization if they're an org_manager
  const availableClasses = user?.role === 'org_manager' && user.organization_id
    ? classes.filter(cls => cls.organization_id === user.organization_id)
    : classes;

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {editRequest ? 'Edit Substitute Request' : 'Create New Substitute Request'}
        </CardTitle>
        <CardDescription>
          {editRequest 
            ? 'Update the substitute request details below.' 
            : 'Fill in the details to create a new substitute request.'
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
              <label htmlFor="class_id" className="text-sm font-medium">
                Class *
              </label>
              <select
                id="class_id"
                value={formData.class_id}
                onChange={(e) => handleChange('class_id', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select a class</option>
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.subject && `- ${cls.subject}`} {cls.room_number && `(${cls.room_number})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="date_needed" className="text-sm font-medium">
                Date Needed *
              </label>
              <Input
                id="date_needed"
                type="date"
                value={formData.date_needed}
                onChange={(e) => handleChange('date_needed', e.target.value)}
                min={today}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="start_time" className="text-sm font-medium">
                Start Time *
              </label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleChange('start_time', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="end_time" className="text-sm font-medium">
                End Time *
              </label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleChange('end_time', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Reason for Substitute
              </label>
              <select
                id="reason"
                value={formData.reason || ''}
                onChange={(e) => handleChange('reason', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select reason (optional)</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Personal Leave">Personal Leave</option>
                <option value="Professional Development">Professional Development</option>
                <option value="Emergency">Emergency</option>
                <option value="Vacation">Vacation</option>
                <option value="Meeting/Conference">Meeting/Conference</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="special_instructions" className="text-sm font-medium">
                Special Instructions
              </label>
              <textarea
                id="special_instructions"
                value={formData.special_instructions || ''}
                onChange={(e) => handleChange('special_instructions', e.target.value)}
                placeholder="Any special instructions for the substitute teacher (optional)"
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Request Guidelines:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Submit requests at least 24 hours in advance when possible</div>
              <div>• Provide clear special instructions for the substitute</div>
              <div>• Include lesson plans or materials location if applicable</div>
              <div>• Emergency requests may have limited substitute availability</div>
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
                ? (editRequest ? 'Updating...' : 'Creating...') 
                : (editRequest ? 'Update Request' : 'Create Request')
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}