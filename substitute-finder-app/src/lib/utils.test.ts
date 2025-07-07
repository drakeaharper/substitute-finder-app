import { describe, it, expect } from 'vitest'

// Simple unit test to verify Vitest is working
describe('Utils', () => {
  it('should run a simple test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should handle string concatenation', () => {
    const str1 = 'hello'
    const str2 = 'world'
    expect(`${str1} ${str2}`).toBe('hello world')
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr.length).toBe(3)
    expect(arr.includes(2)).toBe(true)
  })
})
