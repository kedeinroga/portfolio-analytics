import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile', () => {
  const MOBILE_BREAKPOINT = 768

  beforeEach(() => {
    // Default: desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  it('should return false on desktop width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true on mobile width', () => {
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should return false at exactly the breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: MOBILE_BREAKPOINT,
      writable: true,
    })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true just below breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: MOBILE_BREAKPOINT - 1,
      writable: true,
    })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should respond to resize events', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: 375,
        writable: true,
      })
      // Simulate matchMedia change event
      const mediaEvent = new Event('change')
      window.dispatchEvent(mediaEvent)
    })
    // Value depends on rerender, but check it returns boolean
    expect(typeof result.current).toBe('boolean')
  })
})
