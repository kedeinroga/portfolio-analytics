import { renderHook, waitFor } from '@testing-library/react'
import { useOnScreen } from '../use-on-screen'
import { createRef } from 'react'

// Mock the analytics logging
jest.mock('@/lib/analytics', () => ({
  logPageViewSpecificSection: jest.fn(),
}))

describe('useOnScreen', () => {
  let mockIntersectionObserver: jest.Mock
  let observeMock: jest.Mock
  let unobserveMock: jest.Mock
  let disconnectMock: jest.Mock

  beforeEach(() => {
    observeMock = jest.fn()
    unobserveMock = jest.fn()
    disconnectMock = jest.fn()

    mockIntersectionObserver = jest.fn(function (
      this: any,
      callback: IntersectionObserverCallback
    ) {
      this.observe = observeMock
      this.unobserve = unobserveMock
      this.disconnect = disconnectMock
      this.callback = callback
      this.takeRecords = () => []
    })

    global.IntersectionObserver = mockIntersectionObserver as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return false initially', () => {
    const ref = createRef<HTMLDivElement>()
    const { result } = renderHook(() => useOnScreen(ref))

    expect(result.current).toBe(false)
  })

  it('should observe element when ref is set', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    renderHook(() => useOnScreen(ref))

    expect(observeMock).toHaveBeenCalledWith(element)
  })

  it('should return true when element intersects', async () => {
    const element = document.createElement('div')
    element.id = 'test-section'
    const ref = { current: element }

    const { result } = renderHook(() => useOnScreen(ref))

    // Simulate intersection with act
    const observer = mockIntersectionObserver.mock.instances[0]
    await waitFor(() => {
      observer.callback([{ isIntersecting: true, target: element }])
    })

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('should not change to true when element does not intersect', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { result } = renderHook(() => useOnScreen(ref))

    // Simulate no intersection
    const observer = mockIntersectionObserver.mock.instances[0]
    observer.callback([{ isIntersecting: false, target: element }])

    expect(result.current).toBe(false)
  })

  it('should log analytics when element becomes visible', async () => {
    const { logPageViewSpecificSection } = require('@/lib/analytics')
    const element = document.createElement('div')
    element.id = 'about-section'
    const ref = { current: element }

    renderHook(() => useOnScreen(ref))

    // Simulate intersection
    const observer = mockIntersectionObserver.mock.instances[0]
    await waitFor(() => {
      observer.callback([{ isIntersecting: true, target: element }])
    })

    await waitFor(() => {
      expect(logPageViewSpecificSection).toHaveBeenCalledWith('about-section')
    })
  })

  it('should unobserve element after it becomes visible', async () => {
    const element = document.createElement('div')
    element.id = 'test-section'
    const ref = { current: element }

    renderHook(() => useOnScreen(ref))

    // Simulate intersection
    const observer = mockIntersectionObserver.mock.instances[0]
    await waitFor(() => {
      observer.callback([{ isIntersecting: true, target: element }])
    })

    await waitFor(() => {
      expect(unobserveMock).toHaveBeenCalledWith(element)
    })
  })

  it('should use custom rootMargin', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    renderHook(() => useOnScreen(ref, '-100px'))

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '-100px' }
    )
  })

  it('should use default rootMargin when not provided', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    renderHook(() => useOnScreen(ref))

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '0px' }
    )
  })

  it('should cleanup observer on unmount', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { unmount } = renderHook(() => useOnScreen(ref))

    unmount()

    expect(unobserveMock).toHaveBeenCalledWith(element)
  })

  it('should handle null ref gracefully', () => {
    const ref = { current: null }

    const { result } = renderHook(() => useOnScreen(ref))

    expect(result.current).toBe(false)
    expect(observeMock).not.toHaveBeenCalled()
  })
})
