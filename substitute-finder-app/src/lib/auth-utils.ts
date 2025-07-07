import type { User } from '../types'

// Pure functions for auth operations
export const parseStoredUser = (storedUserString: string | null): User | null => {
  if (!storedUserString) return null
  
  try {
    return JSON.parse(storedUserString)
  } catch {
    return null
  }
}

export const serializeUser = (user: User): string => {
  return JSON.stringify(user)
}

export const isValidUser = (user: unknown): user is User => {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'username' in user &&
    'email' in user &&
    'role' in user &&
    typeof (user as User).id === 'string' &&
    typeof (user as User).username === 'string' &&
    typeof (user as User).email === 'string' &&
    typeof (user as User).role === 'string'
  )
}

export const createAuthState = (user: User | null, isLoading: boolean) => ({
  user,
  isLoading,
  isAuthenticated: user !== null,
  userRole: user?.role || null,
})