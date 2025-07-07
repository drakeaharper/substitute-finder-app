export interface Organization {
  id: string
  name: string
  parent_organization_id?: string
  description?: string
  contact_email?: string
  contact_phone?: string
  created_at: string
  updated_at: string
}

export interface Class {
  id: string
  name: string
  organization_id: string
  subject?: string
  grade_level?: string
  room_number?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'org_manager' | 'substitute'
  organization_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubstituteRequest {
  id: string
  class_id: string
  requested_by: string
  date_needed: string
  start_time: string
  end_time: string
  reason?: string
  special_instructions?: string
  status: 'open' | 'filled' | 'cancelled'
  assigned_substitute_id?: string
  created_at: string
  updated_at: string
}

export interface CreateOrganizationRequest {
  name: string
  parent_organization_id?: string
  description?: string
  contact_email?: string
  contact_phone?: string
}

export interface CreateClassRequest {
  name: string
  organization_id: string
  subject?: string
  grade_level?: string
  room_number?: string
  description?: string
}

export interface CreateUserRequest {
  username: string
  password: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'org_manager' | 'substitute'
  organization_id?: string
}

export interface CreateSubstituteRequestRequest {
  class_id: string
  date_needed: string
  start_time: string
  end_time: string
  reason?: string
  special_instructions?: string
}
