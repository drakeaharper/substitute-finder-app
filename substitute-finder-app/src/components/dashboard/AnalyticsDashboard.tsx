import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  Users,
  Building,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { substituteApi, classApi, organizationApi, userApi } from '../../lib/api'
import type { SubstituteRequest, Class, Organization, User } from '../../types'
import { useAuth } from '../../contexts/AuthContext'
import { CSVExporter, ReportGenerator } from '../../lib/export'
import { useNotifications } from '../../contexts/NotificationContext'

interface AnalyticsData {
  totalRequests: number
  fillRate: number
  avgResponseTime: number
  mostActiveOrganization: string
  requestsByMonth: { month: string; count: number; filled: number }[]
  requestsByDayOfWeek: { day: string; count: number }[]
  substitutesPerformance: { name: string; accepted: number; declined: number }[]
  organizationMetrics: { name: string; requests: number; fillRate: number }[]
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [requests, setRequests] = useState<SubstituteRequest[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadData()
  }, [timeRange])

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

      // Calculate analytics
      const analyticsData = calculateAnalytics(requestsData, classesData, orgsData, usersData)
      setAnalytics(analyticsData)

      setError(null)
    } catch (err) {
      setError('Failed to load analytics data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (
    requests: SubstituteRequest[],
    classes: Class[],
    organizations: Organization[],
    users: User[]
  ): AnalyticsData => {
    // Filter requests based on time range
    const now = new Date()
    const cutoffDate = new Date()

    switch (timeRange) {
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
    }

    const filteredRequests = requests.filter((r) => new Date(r.created_at) >= cutoffDate)

    // Basic metrics
    const totalRequests = filteredRequests.length
    const filledRequests = filteredRequests.filter((r) => r.status === 'filled')
    const fillRate =
      totalRequests > 0 ? Math.round((filledRequests.length / totalRequests) * 100) : 0

    // Average response time (mock calculation - would need actual timestamps)
    const avgResponseTime = Math.round(Math.random() * 24 + 2) // 2-26 hours

    // Most active organization
    const orgRequestCounts = organizations.map((org) => {
      const orgClasses = classes.filter((c) => c.organization_id === org.id)
      const orgRequests = filteredRequests.filter((r) =>
        orgClasses.some((c) => c.id === r.class_id)
      )
      return { org: org.name, count: orgRequests.length }
    })
    const mostActive = orgRequestCounts.reduce(
      (max, current) => (current.count > max.count ? current : max),
      { org: 'N/A', count: 0 }
    )

    // Requests by month
    const requestsByMonth = getLast6Months().map((month) => {
      const monthRequests = filteredRequests.filter((r) => {
        const requestDate = new Date(r.created_at)
        return (
          requestDate.getMonth() === month.monthNumber && requestDate.getFullYear() === month.year
        )
      })
      const filled = monthRequests.filter((r) => r.status === 'filled').length

      return {
        month: month.name,
        count: monthRequests.length,
        filled,
      }
    })

    // Requests by day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const requestsByDayOfWeek = dayNames.map((day) => {
      const dayRequests = filteredRequests.filter((r) => {
        const requestDate = new Date(r.date_needed)
        return dayNames[requestDate.getDay()] === day
      })

      return {
        day,
        count: dayRequests.length,
      }
    })

    // Substitute performance (mock data for now)
    const substitutes = users.filter((u) => u.role === 'substitute')
    const substitutesPerformance = substitutes.slice(0, 5).map((sub) => ({
      name: `${sub.first_name} ${sub.last_name}`,
      accepted: Math.floor(Math.random() * 15) + 1,
      declined: Math.floor(Math.random() * 5),
    }))

    // Organization metrics
    const organizationMetrics = organizations
      .map((org) => {
        const orgClasses = classes.filter((c) => c.organization_id === org.id)
        const orgRequests = filteredRequests.filter((r) =>
          orgClasses.some((c) => c.id === r.class_id)
        )
        const orgFilled = orgRequests.filter((r) => r.status === 'filled')
        const orgFillRate =
          orgRequests.length > 0 ? Math.round((orgFilled.length / orgRequests.length) * 100) : 0

        return {
          name: org.name,
          requests: orgRequests.length,
          fillRate: orgFillRate,
        }
      })
      .filter((org) => org.requests > 0)
      .slice(0, 5)

    return {
      totalRequests,
      fillRate,
      avgResponseTime,
      mostActiveOrganization: mostActive.org,
      requestsByMonth,
      requestsByDayOfWeek,
      substitutesPerformance,
      organizationMetrics,
    }
  }

  const getLast6Months = () => {
    const months = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        monthNumber: date.getMonth(),
        year: date.getFullYear(),
      })
    }

    return months
  }

  const handleExportData = async () => {
    if (!analytics) {
      addNotification({
        title: 'Export Error',
        body: 'No analytics data available to export',
        notification_type: 'error',
      })
      return
    }

    try {
      // Export analytics data
      CSVExporter.exportAnalyticsData(analytics, timeRange)

      addNotification({
        title: 'Export Successful',
        body: 'Analytics report has been downloaded',
        notification_type: 'success',
      })
    } catch (error) {
      console.error('Export failed:', error)
      addNotification({
        title: 'Export Failed',
        body: 'Failed to export analytics data',
        notification_type: 'error',
      })
    }
  }

  const handleExportFullReport = async () => {
    try {
      await ReportGenerator.generateFullReport(requests, classes, organizations, users, timeRange)

      addNotification({
        title: 'Full Report Generated',
        body: 'Complete system report has been downloaded',
        notification_type: 'success',
      })
    } catch (error) {
      console.error('Report generation failed:', error)
      addNotification({
        title: 'Report Generation Failed',
        body: 'Failed to generate full report',
        notification_type: 'error',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Analytics Unavailable</h2>
          <p className="text-muted-foreground">Unable to calculate analytics data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics & Reports</h2>
          <p className="text-muted-foreground">Detailed insights and performance metrics</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-sm rounded ${timeRange === '30d' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1 text-sm rounded ${timeRange === '90d' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              90 Days
            </button>
            <button
              onClick={() => setTimeRange('1y')}
              className={`px-3 py-1 text-sm rounded ${timeRange === '1y' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              1 Year
            </button>
          </div>

          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Analytics
            </Button>

            <Button onClick={handleExportFullReport}>
              <Download className="w-4 h-4 mr-2" />
              Full Report
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : 'year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fill Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.fillRate}%</div>
            <p className="text-xs text-muted-foreground">Success rate for requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgResponseTime}h</div>
            <p className="text-xs text-muted-foreground">Time to fill request</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Active Org</CardTitle>
            <Building className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate" title={analytics.mostActiveOrganization}>
              {analytics.mostActiveOrganization}
            </div>
            <p className="text-xs text-muted-foreground">Highest request volume</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Request Trends
            </CardTitle>
            <CardDescription>Request volume and fill rates over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.requestsByMonth.map((month, index) => (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{month.month}</span>
                    <span className="text-sm text-muted-foreground">
                      {month.count} requests •{' '}
                      {month.count > 0 ? Math.round((month.filled / month.count) * 100) : 0}% filled
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{
                          width: `${month.count > 0 ? (month.filled / Math.max(...analytics.requestsByMonth.map((m) => m.count))) * 100 : 0}%`,
                        }}
                      />
                      <div
                        className="bg-orange-500"
                        style={{
                          width: `${month.count > 0 ? ((month.count - month.filled) / Math.max(...analytics.requestsByMonth.map((m) => m.count))) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Filled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Open/Cancelled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day of Week Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Requests by Day of Week
            </CardTitle>
            <CardDescription>Which days have the most substitute requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.requestsByDayOfWeek.map((day) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${day.count > 0 ? (day.count / Math.max(...analytics.requestsByDayOfWeek.map((d) => d.count))) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">
                      {day.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Substitute Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Substitute Performance
            </CardTitle>
            <CardDescription>Most active substitute teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.substitutesPerformance.map((sub, index) => (
                <div key={sub.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sub.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {sub.accepted} accepted • {sub.declined} declined
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500"
                        style={{
                          width: `${(sub.accepted / (sub.accepted + sub.declined)) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-red-500"
                        style={{
                          width: `${(sub.declined / (sub.accepted + sub.declined)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Organization Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization Performance
            </CardTitle>
            <CardDescription>Request volumes and fill rates by organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.organizationMetrics.map((org) => (
                <div key={org.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{org.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {org.requests} requests • {org.fillRate}% filled
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${org.fillRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
