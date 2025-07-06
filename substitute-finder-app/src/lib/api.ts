import { invoke } from '@tauri-apps/api/core';
import type {
  Organization,
  Class,
  User,
  SubstituteRequest,
  CreateOrganizationRequest,
  CreateClassRequest,
  CreateUserRequest,
  CreateSubstituteRequestRequest,
} from '../types';

// Organization API
export const organizationApi = {
  create: (data: CreateOrganizationRequest): Promise<Organization> =>
    invoke('create_organization', { request: data }),
  
  getAll: (): Promise<Organization[]> =>
    invoke('get_organizations'),
  
  getById: (id: string): Promise<Organization | null> =>
    invoke('get_organization_by_id', { id }),
  
  update: (id: string, data: CreateOrganizationRequest): Promise<Organization> =>
    invoke('update_organization', { id, request: data }),
  
  delete: (id: string): Promise<void> =>
    invoke('delete_organization', { id }),
};

// Class API
export const classApi = {
  create: (data: CreateClassRequest): Promise<Class> =>
    invoke('create_class', { request: data }),
  
  getAll: (): Promise<Class[]> =>
    invoke('get_classes'),
  
  getByOrganization: (organizationId: string): Promise<Class[]> =>
    invoke('get_classes_by_organization', { organizationId }),
  
  getById: (id: string): Promise<Class | null> =>
    invoke('get_class_by_id', { id }),
  
  update: (id: string, data: CreateClassRequest): Promise<Class> =>
    invoke('update_class', { id, request: data }),
  
  delete: (id: string): Promise<void> =>
    invoke('delete_class', { id }),
};

// User API
export const userApi = {
  create: (data: CreateUserRequest): Promise<User> =>
    invoke('create_user', { request: data }),
  
  getAll: (): Promise<User[]> =>
    invoke('get_users'),
  
  login: (username: string, password: string): Promise<User> =>
    invoke('login', { username, password }),
};

// Substitute Request API
export const substituteApi = {
  create: (requestedBy: string, data: CreateSubstituteRequestRequest): Promise<SubstituteRequest> =>
    invoke('create_substitute_request', { requestedBy, request: data }),
  
  getAll: (): Promise<SubstituteRequest[]> =>
    invoke('get_substitute_requests'),
  
  getByStatus: (status: string): Promise<SubstituteRequest[]> =>
    invoke('get_substitute_requests_by_status', { status }),
  
  getById: (id: string): Promise<SubstituteRequest | null> =>
    invoke('get_substitute_request_by_id', { id }),
  
  updateStatus: (id: string, status: string, assignedSubstituteId?: string): Promise<SubstituteRequest> =>
    invoke('update_substitute_request_status', { id, status, assignedSubstituteId }),
  
  delete: (id: string): Promise<void> =>
    invoke('delete_substitute_request', { id }),
};