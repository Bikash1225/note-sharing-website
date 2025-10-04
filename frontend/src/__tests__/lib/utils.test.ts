import { cn, formatDate, formatRelativeTime, debounce, throttle } from '@/lib/utils'

describe('Utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
      expect(cn('px-4', 'px-2')).toBe('px-2') // tailwind-merge should handle conflicts
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date)
      expect(formatted).toBe('January 15, 2024')
    })
  })

  describe('formatRelativeTime', () => {
    it('returns "just now" for recent dates', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('just now')
    })

    it('returns minutes ago for recent dates', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago')
    })

    it('returns hours ago for older dates', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago')
    })
  })

  describe('debounce', () => {
    jest.useFakeTimers()

    it('delays function execution', () => {
      const fn = jest.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      expect(fn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous calls', () => {
      const fn = jest.fn()
      const debouncedFn = debounce(fn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      jest.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    jest.useFakeTimers()

    it('limits function calls', () => {
      const fn = jest.fn()
      const throttledFn = throttle(fn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      expect(fn).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(100)
      throttledFn()
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})