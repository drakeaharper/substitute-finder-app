import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('combines multiple class names', () => {
    const result = cn('class1', 'class2', 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('handles conditional classes with clsx', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
    expect(result).toBe('base-class conditional-class')
  })

  it('merges conflicting Tailwind classes with twMerge', () => {
    const result = cn('px-2', 'px-4') // px-4 should override px-2
    expect(result).toBe('px-4')
  })

  it('handles empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles null and undefined values', () => {
    const result = cn('class1', null, undefined, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('combines complex Tailwind class scenarios', () => {
    const result = cn(
      'bg-blue-500 text-white p-4',
      'bg-red-500', // Should override bg-blue-500
      'hover:bg-red-600',
      false && 'hidden-class'
    )
    expect(result).toBe('text-white p-4 bg-red-500 hover:bg-red-600')
  })

  it('handles object syntax from clsx', () => {
    const result = cn({
      'active': true,
      'disabled': false,
      'bg-blue-500': true,
    })
    expect(result).toBe('active bg-blue-500')
  })

  it('handles array syntax from clsx', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('preserves important modifiers in Tailwind', () => {
    const result = cn('!text-red-500', 'text-blue-500')
    expect(result).toBe('!text-red-500 text-blue-500')
  })

  it('handles responsive and state modifiers', () => {
    const result = cn(
      'text-sm md:text-lg',
      'hover:text-blue-500 focus:text-green-500',
      'dark:text-white'
    )
    expect(result).toBe('text-sm md:text-lg hover:text-blue-500 focus:text-green-500 dark:text-white')
  })
})
