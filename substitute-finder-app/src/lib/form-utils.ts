// Pure functions for form handling
export const createFormData = <T extends Record<string, unknown>>(initialValues: T): T => {
  return { ...initialValues }
}

export const updateFormField = <T extends Record<string, unknown>>(
  formData: T,
  field: keyof T,
  value: T[keyof T]
): T => {
  return {
    ...formData,
    [field]: value,
  }
}

export const validateLoginForm = (username: string, password: string): string[] => {
  const errors: string[] = []
  
  if (!username.trim()) {
    errors.push('Username is required')
  }
  
  if (!password.trim()) {
    errors.push('Password is required')
  }
  
  if (username.length > 0 && username.length < 3) {
    errors.push('Username must be at least 3 characters')
  }
  
  if (password.length > 0 && password.length < 3) {
    errors.push('Password must be at least 3 characters')
  }
  
  return errors
}

export const isFormValid = (username: string, password: string): boolean => {
  return validateLoginForm(username, password).length === 0
}

export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

export const createLoadingState = (isLoading: boolean) => ({
  isLoading,
  disabled: isLoading,
  buttonText: isLoading ? 'Signing in...' : 'Sign In',
})