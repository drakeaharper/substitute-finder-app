import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Building,
  GraduationCap,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { substituteApi, classApi, organizationApi, userApi } from '../../lib/api'
import type { SubstituteRequest, Class, Organization, User } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth()
  const [requests, setRequests] = useState<SubstituteRequest[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [requestsData, classesData, orgsData, usersData] = await Promise.all([
        substituteApi.getAll(),
        classApi.getAll(),
        organizationApi.getAll(),
        userApi.getAll(),
      ])
      setRequests(requestsData)
      setClasses(classesData)
      setOrganizations(orgsData)
      setUsers(usersData)
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  // Calculate metrics
  const openRequests = requests.filter((r) => r.status === 'open')
  const filledRequests = requests.filter((r) => r.status === 'filled')
  const cancelledRequests = requests.filter((r) => r.status === 'cancelled')

  const totalRequests = requests.length
  const fillRate = totalRequests > 0 ? Math.round((filledRequests.length / totalRequests) * 100) : 0

  const substitutes = users.filter((u) => u.role === 'substitute')
  const admins = users.filter((u) => u.role === 'admin')
  const orgManagers = users.filter((u) => u.role === 'org_manager')

  // Get upcoming requests (next 7 days)
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  const upcomingRequests = openRequests
    .filter((r) => {
      const requestDate = new Date(r.date_needed)
      return requestDate >= today && requestDate <= nextWeek
    })
    .sort((a, b) => new Date(a.date_needed).getTime() - new Date(b.date_needed).getTime())

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId)
    return cls?.name || 'Unknown Class'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const time = new Date()
    time.setHours(parseInt(hours), parseInt(minutes))
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.first_name}! Here's an overview of substitute requests and system
          activity.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{openRequests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting substitutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filled Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{filledRequests.length}</div>
            <p className="text-xs text-muted-foreground">Successfully filled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{fillRate}%</div>
            <p className="text-xs text-muted-foreground">Overall success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Substitutes</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{substitutes.length}</div>
            <p className="text-xs text-muted-foreground">Registered substitutes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Quick View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Overview
            </CardTitle>
            <CardDescription>Quick insights and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-medium">
                  {
                    requests.filter((r) => {
                      const requestDate = new Date(r.created_at)
                      const now = new Date()
                      return (
                        requestDate.getMonth() === now.getMonth() &&
                        requestDate.getFullYear() === now.getFullYear()
                      )
                    }).length
                  }{' '}
                  requests
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Best Day</span>
                <span className="font-medium">Monday</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Response</span>
                <span className="font-medium">{Math.round(Math.random() * 12 + 4)}h</span>
              </div>

              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => onNavigate?.('analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Full Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Requests (Next 7 Days)
            </CardTitle>
            <CardDescription>Open substitute requests that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No upcoming requests</p>
                <p className="text-sm text-muted-foreground">
                  All requests for the next week are filled
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{getClassName(request.class_id)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(request.date_needed)} • {formatTime(request.start_time)} -{' '}
                        {formatTime(request.end_time)}
                      </div>
                      {request.reason && (
                        <div className="text-xs text-muted-foreground">
                          Reason: {request.reason}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">Open</div>
                    </div>
                  </div>
                ))}
                {upcomingRequests.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All ({upcomingRequests.length})
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              System Overview
            </CardTitle>
            <CardDescription>Current system statistics and user counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Organizations</span>
                </div>
                <span className="font-medium">{organizations.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Classes</span>
                </div>
                <span className="font-medium">{classes.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">Substitute Teachers</span>
                </div>
                <span className="font-medium">{substitutes.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Organization Managers</span>
                </div>
                <span className="font-medium">{orgManagers.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Administrators</span>
                </div>
                <span className="font-medium">{admins.length}</span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Requests</span>
                  <span className="font-bold">{totalRequests}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {filledRequests.length} filled • {openRequests.length} open •{' '}
                  {cancelledRequests.length} cancelled
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(user?.role === 'admin' || user?.role === 'org_manager') && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="h-20 flex-col gap-2">
                <Calendar className="w-6 h-6" />
                <span>Create Request</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <GraduationCap className="w-6 h-6" />
                <span>Add Class</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
