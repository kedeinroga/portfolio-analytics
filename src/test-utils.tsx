import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { I18nProvider } from '@/context/i18n'

function AllProviders({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>
}

// Custom render function with all providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const mockAnalyticsData = (overrides = {}) => ({
  eventType: 'page_view',
  page_path: '/',
  timestamp: new Date('2024-01-15T10:00:00Z'),
  location: {
    country: 'Colombia',
    city: 'Bogotá',
    lat: 4.7110,
    lon: -74.0721,
  },
  ...overrides,
})

export const mockCvDownloadData = (overrides = {}) => ({
  eventType: 'cv_download',
  language: 'es',
  timestamp: new Date('2024-01-15T10:00:00Z'),
  location: {
    country: 'Colombia',
    city: 'Bogotá',
    lat: 4.7110,
    lon: -74.0721,
  },
  ...overrides,
})

export const mockSectionViewData = (overrides = {}) => ({
  eventType: 'page_view_specific_section',
  section: 'about',
  timestamp: new Date('2024-01-15T10:00:00Z'),
  ...overrides,
})

// Helper to create Firestore-like timestamp
export const createFirestoreTimestamp = (date: Date) => ({
  toDate: () => date,
})
