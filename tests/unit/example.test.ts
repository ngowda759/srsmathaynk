import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const text = 'Hello, World!'
    expect(text.toLowerCase()).toBe('hello, world!')
    expect(text.includes('World')).toBe(true)
  })

  it('should handle array operations', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(arr.filter(n => n > 2)).toEqual([3, 4, 5])
    expect(arr.map(n => n * 2)).toEqual([2, 4, 6, 8, 10])
  })
})
