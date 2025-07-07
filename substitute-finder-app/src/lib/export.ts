import type { SubstituteRequest, Class, Organization, User } from '../types'

// CSV Export Utilities
export class CSVExporter {
  private static escapeCSVValue(value: any): string {
    if (value === null || value === undefined) return ''

    const stringValue = String(value)

    // If the value contains comma, newline, or quote, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  private static arrayToCSV(headers: string[], rows: any[][]): string {
    const csvHeaders = headers.join(',')
    const csvRows = rows.map((row) => row.map((cell) => CSVExporter.escapeCSVValue(cell)).join(','))

    return [csvHeaders, ...csvRows].join('\n')
  }

  private static downloadCSV(filename: string, csvContent: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  // Export substitute requests
  static exportSubstituteRequests(
    requests: SubstituteRequest[],
    classes: Class[],
    organizations: Organization[],
    users: User[]
  ): void {
    const headers = [
      'Request ID',
      'Class Name',
      'Organization',
      'Date Needed',
      'Start Time',
      'End Time',
      'Status',
      'Requested By',
      'Assigned Substitute',
      'Reason',
      'Special Instructions',
      'Created At',
      'Updated At',
    ]

    const rows = requests.map((request) => {
      const requestClass = classes.find((c) => c.id === request.class_id)
      const organization = requestClass
        ? organizations.find((o) => o.id === requestClass.organization_id)
        : null
      const requestedBy = users.find((u) => u.id === request.requested_by)
      const assignedSubstitute = request.assigned_substitute_id
        ? users.find((u) => u.id === request.assigned_substitute_id)
        : null

      return [
        request.id,
        requestClass?.name || 'Unknown Class',
        organization?.name || 'Unknown Organization',
        request.date_needed,
        request.start_time,
        request.end_time,
        request.status,
        requestedBy ? `${requestedBy.first_name} ${requestedBy.last_name}` : 'Unknown',
        assignedSubstitute
          ? `${assignedSubstitute.first_name} ${assignedSubstitute.last_name}`
          : '',
        request.reason || '',
        request.special_instructions || '',
        new Date(request.created_at).toLocaleString(),
        new Date(request.updated_at).toLocaleString(),
      ]
    })

    const csvContent = CSVExporter.arrayToCSV(headers, rows)
    const timestamp = new Date().toISOString().split('T')[0]
    CSVExporter.downloadCSV(`substitute-requests-${timestamp}.csv`, csvContent)
  }

  // Export analytics data
  static exportAnalyticsData(analyticsData: any, timeRange: string): void {
    const timestamp = new Date().toISOString().split('T')[0]

    // Summary metrics
    const summaryHeaders = ['Metric', 'Value']
    const summaryRows = [
      ['Time Range', timeRange],
      ['Total Requests', analyticsData.totalRequests],
      ['Fill Rate (%)', analyticsData.fillRate],
      ['Average Response Time (hours)', analyticsData.avgResponseTime],
      ['Most Active Organization', analyticsData.mostActiveOrganization],
    ]

    let csvContent = '=== ANALYTICS SUMMARY ===\n'
    csvContent += CSVExporter.arrayToCSV(summaryHeaders, summaryRows)
    csvContent += '\n\n=== MONTHLY TRENDS ===\n'

    // Monthly trends
    const monthlyHeaders = ['Month', 'Total Requests', 'Filled Requests', 'Fill Rate (%)']
    const monthlyRows = analyticsData.requestsByMonth.map((month: any) => [
      month.month,
      month.count,
      month.filled,
      month.count > 0 ? Math.round((month.filled / month.count) * 100) : 0,
    ])

    csvContent += CSVExporter.arrayToCSV(monthlyHeaders, monthlyRows)
    csvContent += '\n\n=== DAY OF WEEK ANALYSIS ===\n'

    // Day of week analysis
    const dayHeaders = ['Day of Week', 'Request Count']
    const dayRows = analyticsData.requestsByDayOfWeek.map((day: any) => [day.day, day.count])

    csvContent += CSVExporter.arrayToCSV(dayHeaders, dayRows)
    csvContent += '\n\n=== SUBSTITUTE PERFORMANCE ===\n'

    // Substitute performance
    const subHeaders = ['Substitute Name', 'Accepted', 'Declined', 'Acceptance Rate (%)']
    const subRows = analyticsData.substitutesPerformance.map((sub: any) => [
      sub.name,
      sub.accepted,
      sub.declined,
      Math.round((sub.accepted / (sub.accepted + sub.declined)) * 100),
    ])

    csvContent += CSVExporter.arrayToCSV(subHeaders, subRows)
    csvContent += '\n\n=== ORGANIZATION PERFORMANCE ===\n'

    // Organization performance
    const orgHeaders = ['Organization', 'Total Requests', 'Fill Rate (%)']
    const orgRows = analyticsData.organizationMetrics.map((org: any) => [
      org.name,
      org.requests,
      org.fillRate,
    ])

    csvContent += CSVExporter.arrayToCSV(orgHeaders, orgRows)

    CSVExporter.downloadCSV(`analytics-report-${timeRange}-${timestamp}.csv`, csvContent)
  }

  // Export users
  static exportUsers(users: User[], organizations: Organization[]): void {
    const headers = [
      'User ID',
      'Username',
      'Email',
      'First Name',
      'Last Name',
      'Role',
      'Organization',
      'Active',
      'Created At',
      'Updated At',
    ]

    const rows = users.map((user) => {
      const organization = user.organization_id
        ? organizations.find((o) => o.id === user.organization_id)
        : null

      return [
        user.id,
        user.username,
        user.email,
        user.first_name,
        user.last_name,
        user.role,
        organization?.name || '',
        user.is_active ? 'Yes' : 'No',
        new Date(user.created_at).toLocaleString(),
        new Date(user.updated_at).toLocaleString(),
      ]
    })

    const csvContent = CSVExporter.arrayToCSV(headers, rows)
    const timestamp = new Date().toISOString().split('T')[0]
    CSVExporter.downloadCSV(`users-${timestamp}.csv`, csvContent)
  }

  // Export classes
  static exportClasses(classes: Class[], organizations: Organization[]): void {
    const headers = [
      'Class ID',
      'Name',
      'Organization',
      'Subject',
      'Grade Level',
      'Room Number',
      'Description',
      'Created At',
      'Updated At',
    ]

    const rows = classes.map((classItem) => {
      const organization = organizations.find((o) => o.id === classItem.organization_id)

      return [
        classItem.id,
        classItem.name,
        organization?.name || 'Unknown Organization',
        classItem.subject || '',
        classItem.grade_level || '',
        classItem.room_number || '',
        classItem.description || '',
        new Date(classItem.created_at).toLocaleString(),
        new Date(classItem.updated_at).toLocaleString(),
      ]
    })

    const csvContent = CSVExporter.arrayToCSV(headers, rows)
    const timestamp = new Date().toISOString().split('T')[0]
    CSVExporter.downloadCSV(`classes-${timestamp}.csv`, csvContent)
  }

  // Export organizations
  static exportOrganizations(organizations: Organization[]): void {
    const headers = [
      'Organization ID',
      'Name',
      'Parent Organization',
      'Description',
      'Contact Email',
      'Contact Phone',
      'Created At',
      'Updated At',
    ]

    const rows = organizations.map((org) => {
      const parentOrg = org.parent_organization_id
        ? organizations.find((o) => o.id === org.parent_organization_id)
        : null

      return [
        org.id,
        org.name,
        parentOrg?.name || '',
        org.description || '',
        org.contact_email || '',
        org.contact_phone || '',
        new Date(org.created_at).toLocaleString(),
        new Date(org.updated_at).toLocaleString(),
      ]
    })

    const csvContent = CSVExporter.arrayToCSV(headers, rows)
    const timestamp = new Date().toISOString().split('T')[0]
    CSVExporter.downloadCSV(`organizations-${timestamp}.csv`, csvContent)
  }
}

// Excel Export Utilities (Basic XLSX format using CSV conversion)
export class ExcelExporter {
  // For now, we'll create Excel-compatible CSV files
  // In a production app, you might want to use a library like xlsx or exceljs

  static exportSubstituteRequestsAsExcel(
    requests: SubstituteRequest[],
    classes: Class[],
    organizations: Organization[],
    users: User[]
  ): void {
    // Create a more structured format for Excel
    const timestamp = new Date().toISOString().split('T')[0]

    // Create worksheet data
    const headers = [
      'Request ID',
      'Class Name',
      'Organization',
      'Date Needed',
      'Start Time',
      'End Time',
      'Status',
      'Requested By',
      'Assigned Substitute',
      'Reason',
      'Special Instructions',
      'Created At',
      'Updated At',
    ]

    const rows = requests.map((request) => {
      const requestClass = classes.find((c) => c.id === request.class_id)
      const organization = requestClass
        ? organizations.find((o) => o.id === requestClass.organization_id)
        : null
      const requestedBy = users.find((u) => u.id === request.requested_by)
      const assignedSubstitute = request.assigned_substitute_id
        ? users.find((u) => u.id === request.assigned_substitute_id)
        : null

      return [
        request.id,
        requestClass?.name || 'Unknown Class',
        organization?.name || 'Unknown Organization',
        request.date_needed,
        request.start_time,
        request.end_time,
        request.status,
        requestedBy ? `${requestedBy.first_name} ${requestedBy.last_name}` : 'Unknown',
        assignedSubstitute
          ? `${assignedSubstitute.first_name} ${assignedSubstitute.last_name}`
          : '',
        request.reason || '',
        request.special_instructions || '',
        new Date(request.created_at).toLocaleString(),
        new Date(request.updated_at).toLocaleString(),
      ]
    })

    // Create CSV content with Excel-friendly formatting
    const csvContent = CSVExporter['arrayToCSV'](headers, rows)

    // Download as .csv but with Excel-compatible formatting
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `substitute-requests-${timestamp}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
}

// Report Generator - Combines multiple exports
export class ReportGenerator {
  static async generateFullReport(
    requests: SubstituteRequest[],
    classes: Class[],
    organizations: Organization[],
    users: User[],
    timeRange: string = '30d'
  ): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0]

    // Filter data based on time range if needed
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

    // Generate summary report
    const totalRequests = filteredRequests.length
    const filledRequests = filteredRequests.filter((r) => r.status === 'filled')
    const fillRate =
      totalRequests > 0 ? Math.round((filledRequests.length / totalRequests) * 100) : 0

    const summaryData = [
      ['=== SUBSTITUTE FINDER APP REPORT ==='],
      [`Generated: ${new Date().toLocaleString()}`],
      [`Time Range: ${timeRange}`],
      [''],
      ['=== SUMMARY METRICS ==='],
      [`Total Requests: ${totalRequests}`],
      [`Filled Requests: ${filledRequests.length}`],
      [`Open Requests: ${filteredRequests.filter((r) => r.status === 'open').length}`],
      [`Cancelled Requests: ${filteredRequests.filter((r) => r.status === 'cancelled').length}`],
      [`Fill Rate: ${fillRate}%`],
      [''],
      [`Total Organizations: ${organizations.length}`],
      [`Total Classes: ${classes.length}`],
      [`Total Users: ${users.length}`],
      [`Substitute Teachers: ${users.filter((u) => u.role === 'substitute').length}`],
      [''],
      ['=== DETAILED DATA ==='],
      ['See individual CSV files for detailed breakdowns:'],
      ['- substitute-requests-[date].csv'],
      ['- users-[date].csv'],
      ['- classes-[date].csv'],
      ['- organizations-[date].csv'],
    ]

    // Create summary CSV
    const summaryCSV = summaryData
      .map((row) => (Array.isArray(row) ? row.join(',') : row))
      .join('\n')

    const blob = new Blob([summaryCSV], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `summary-report-${timestamp}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    // Also trigger individual exports
    CSVExporter.exportSubstituteRequests(filteredRequests, classes, organizations, users)
  }
}
