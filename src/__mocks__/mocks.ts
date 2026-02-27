// Mock Firebase Analytics
export const mockAnalytics = Promise.resolve({
  app: {},
  name: 'analytics',
})

export const mockLogEvent = jest.fn()

// Mock Firestore
export const mockAddDoc = jest.fn()
export const mockCollection = jest.fn()
export const mockGetFirestore = jest.fn(() => ({}))

// Mock Firebase app
export const mockApp = {}

// Mock gtag
export const mockGtagPageview = jest.fn()
export const mockGtagEvent = jest.fn()

// Mock geolocation API response
export const mockGeolocationResponse = {
  country: 'Colombia',
  city: 'Bogotá',
  lat: 4.7110,
  lon: -74.0721,
}

// Reset all mocks
export const resetAllMocks = () => {
  mockLogEvent.mockClear()
  mockAddDoc.mockClear()
  mockCollection.mockClear()
  mockGtagPageview.mockClear()
  mockGtagEvent.mockClear()
}
