import type React from 'react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { classApi } from '../../lib/api'
import type { Class, Organization, CreateClassRequest } from '../../types'

interface ClassFormProps {
  class?: Class | null
  organizations: Organization[]
  onSubmit: () => void
  onCancel: () => void
}

const COMMON_SUBJECTS = [
  'Mathematics',
  'English Language Arts',
  'Science',
  'Social Studies',
  'Physical Education',
  'Art',
  'Music',
  'Computer Science',
  'Foreign Language',
  'Health',
  'Library',
  'Special Education',
]

const GRADE_LEVELS = [
  'Pre-K',
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  '6th Grade',
  '7th Grade',
  '8th Grade',
  '9th Grade',
  '10th Grade',
  '11th Grade',
  '12th Grade',
  'Mixed Grades',
]

export function ClassForm({ class: editClass, organizations, onSubmit, onCancel }: ClassFormProps) {
  const [formData, setFormData] = useState<CreateClassRequest>({
    name: editClass?.name || '',
    organization_id: editClass?.organization_id || '',
    subject: editClass?.subject || '',
    grade_level: editClass?.grade_level || '',
    room_number: editClass?.room_number || '',
    description: editClass?.description || '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const submitData = {
        ...formData,
        subject: formData.subject || undefined,
        grade_level: formData.grade_level || undefined,
        room_number: formData.room_number || undefined,
        description: formData.description || undefined,
      }

      if (editClass) {
        await classApi.update(editClass.id, submitData)
      } else {
        await classApi.create(submitData)
      }

      onSubmit()
    } catch (err) {
      setError(`Failed to ${editClass ? 'update' : 'create'} class`)
      console.error('Error submitting class:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateClassRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editClass ? 'Edit Class' : 'Create New Class'}</CardTitle>
        <CardDescription>
          {editClass
            ? 'Update the class details below.'
            : 'Fill in the details to create a new class.'}
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
                Class Name *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Advanced Mathematics, 5th Grade Science"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="organization" className="text-sm font-medium">
                Organization *
              </label>
              <select
                id="organization"
                value={formData.organization_id}
                onChange={(e) => handleChange('organization_id', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <select
                id="subject"
                value={formData.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select subject (optional)</option>
                {COMMON_SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="grade_level" className="text-sm font-medium">
                Grade Level
              </label>
              <select
                id="grade_level"
                value={formData.grade_level || ''}
                onChange={(e) => handleChange('grade_level', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select grade level (optional)</option>
                {GRADE_LEVELS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="room_number" className="text-sm font-medium">
                Room Number
              </label>
              <Input
                id="room_number"
                type="text"
                value={formData.room_number || ''}
                onChange={(e) => handleChange('room_number', e.target.value)}
                placeholder="e.g., Room 101, Lab A, Gym"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Additional details about the class (optional)"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? editClass
                  ? 'Updating...'
                  : 'Creating...'
                : editClass
                  ? 'Update Class'
                  : 'Create Class'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
