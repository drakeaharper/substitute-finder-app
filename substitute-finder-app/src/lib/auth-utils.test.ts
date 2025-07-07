import { describe, it, expect } from 'vitest'
import { parseStoredUser, serializeUser, isValidUser, createAuthState } from './auth-utils'
import type { User } from '../types'

const mockUser: User = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'admin',
  organization_id: '1',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

describe('parseStoredUser', () => {
  it('returns null for null input', () => {
    expect(parseStoredUser(null)).toBe(null)
  })

  it('returns null for empty string', () => {
    expect(parseStoredUser('')).toBe(null)
  })

  it('parses valid JSON string', () => {
    const userString = JSON.stringify(mockUser)
    expect(parseStoredUser(userString)).toEqual(mockUser)
  })

  it('returns null for invalid JSON', () => {
    expect(parseStoredUser('invalid-json')).toBe(null)
  })

  it('returns null for malformed JSON object', () => {
    expect(parseStoredUser('{"incomplete":')).toBe(null)
  })
})

describe('serializeUser', () => {
  it('serializes user object to JSON string', () => {
    const result = serializeUser(mockUser)
    expect(result).toBe(JSON.stringify(mockUser))
    expect(JSON.parse(result)).toEqual(mockUser)
  })

  it('handles user with minimal required fields', () => {
    const minUser: User = {
      id: '1',
      username: 'user',
      email: 'user@test.com',
      first_name: 'First',
      last_name: 'Last',
      role: 'substitute',
      organization_id: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    }
    const result = serializeUser(minUser)
    expect(JSON.parse(result)).toEqual(minUser)
  })
})

describe('isValidUser', () => {
  it('returns true for valid user object', () => {
    expect(isValidUser(mockUser)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isValidUser(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidUser(undefined)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isValidUser('not-an-object')).toBe(false)
    expect(isValidUser(123)).toBe(false)
    expect(isValidUser(true)).toBe(false)
  })

  it('returns false for object missing required fields', () => {
    expect(isValidUser({})).toBe(false)
    expect(isValidUser({ id: '1' })).toBe(false)
    expect(isValidUser({ id: '1', username: 'user' })).toBe(false)
  })

  it('returns false for object with wrong field types', () => {
    expect(isValidUser({ 
      id: 123, // should be string
      username: 'user',
      email: 'email',
      role: 'admin'
    })).toBe(false)

    expect(isValidUser({
      id: '1',
      username: null, // should be string
      email: 'email',
      role: 'admin'
    })).toBe(false)
  })
})

describe('createAuthState', () => {
  it('creates auth state for authenticated user', () => {
    const state = createAuthState(mockUser, false)
    expect(state).toEqual({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      userRole: 'admin',
    })
  })

  it('creates auth state for unauthenticated user', () => {
    const state = createAuthState(null, false)
    expect(state).toEqual({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      userRole: null,
    })
  })

  it('creates loading auth state', () => {
    const state = createAuthState(null, true)
    expect(state).toEqual({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      userRole: null,
    })
  })

  it('preserves user role correctly', () => {
    const substituteUser = { ...mockUser, role: 'substitute' }
    const state = createAuthState(substituteUser, false)
    expect(state.userRole).toBe('substitute')
  })
})