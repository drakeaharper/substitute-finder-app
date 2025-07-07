import { describe, it, expect } from 'vitest'
import {
  createFormData,
  updateFormField,
  validateLoginForm,
  isFormValid,
  formatErrorMessage,
  createLoadingState,
} from './form-utils'

describe('createFormData', () => {
  it('creates a copy of initial values', () => {
    const initial = { username: '', password: '' }
    const result = createFormData(initial)
    
    expect(result).toEqual(initial)
    expect(result).not.toBe(initial) // Should be a copy
  })

  it('works with different object types', () => {
    const initial = { name: 'test', age: 25, active: true }
    const result = createFormData(initial)
    
    expect(result).toEqual(initial)
  })
})

describe('updateFormField', () => {
  it('updates a single field', () => {
    const formData = { username: '', password: '' }
    const result = updateFormField(formData, 'username', 'newuser')
    
    expect(result).toEqual({ username: 'newuser', password: '' })
    expect(result).not.toBe(formData) // Should be immutable
  })

  it('preserves other fields', () => {
    const formData = { username: 'user', password: 'pass', email: 'test@test.com' }
    const result = updateFormField(formData, 'password', 'newpass')
    
    expect(result).toEqual({
      username: 'user',
      password: 'newpass',
      email: 'test@test.com',
    })
  })
})

describe('validateLoginForm', () => {
  it('returns no errors for valid input', () => {
    const errors = validateLoginForm('validuser', 'validpass')
    expect(errors).toEqual([])
  })

  it('returns error for empty username', () => {
    const errors = validateLoginForm('', 'password')
    expect(errors).toContain('Username is required')
  })

  it('returns error for empty password', () => {
    const errors = validateLoginForm('username', '')
    expect(errors).toContain('Password is required')
  })

  it('returns error for short username', () => {
    const errors = validateLoginForm('ab', 'password')
    expect(errors).toContain('Username must be at least 3 characters')
  })

  it('returns error for short password', () => {
    const errors = validateLoginForm('username', 'ab')
    expect(errors).toContain('Password must be at least 3 characters')
  })

  it('returns multiple errors when multiple fields are invalid', () => {
    const errors = validateLoginForm('', '')
    expect(errors).toHaveLength(2)
    expect(errors).toContain('Username is required')
    expect(errors).toContain('Password is required')
  })

  it('handles whitespace-only input', () => {
    const errors = validateLoginForm('   ', '   ')
    expect(errors).toContain('Username is required')
    expect(errors).toContain('Password is required')
  })
})

describe('isFormValid', () => {
  it('returns true for valid form', () => {
    expect(isFormValid('validuser', 'validpass')).toBe(true)
  })

  it('returns false for invalid form', () => {
    expect(isFormValid('', 'password')).toBe(false)
    expect(isFormValid('username', '')).toBe(false)
    expect(isFormValid('ab', 'ab')).toBe(false)
  })
})

describe('formatErrorMessage', () => {
  it('formats Error objects', () => {
    const error = new Error('Test error')
    expect(formatErrorMessage(error)).toBe('Test error')
  })

  it('formats string errors', () => {
    expect(formatErrorMessage('String error')).toBe('String error')
  })

  it('formats unknown errors', () => {
    expect(formatErrorMessage(null)).toBe('An unexpected error occurred')
    expect(formatErrorMessage(undefined)).toBe('An unexpected error occurred')
    expect(formatErrorMessage(123)).toBe('An unexpected error occurred')
    expect(formatErrorMessage({})).toBe('An unexpected error occurred')
  })
})

describe('createLoadingState', () => {
  it('creates loading state when loading', () => {
    const state = createLoadingState(true)
    expect(state).toEqual({
      isLoading: true,
      disabled: true,
      buttonText: 'Signing in...',
    })
  })

  it('creates idle state when not loading', () => {
    const state = createLoadingState(false)
    expect(state).toEqual({
      isLoading: false,
      disabled: false,
      buttonText: 'Sign In',
    })
  })
})