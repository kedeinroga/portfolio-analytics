// Mock gtag
export const mockGtagPageview = jest.fn()
export const mockGtagEvent = jest.fn()

// Reset all mocks
export const resetAllMocks = () => {
  mockGtagPageview.mockClear()
  mockGtagEvent.mockClear()
}
