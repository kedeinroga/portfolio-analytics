import { processAnalyticsData } from '../analyticsProcessor'
import { createFirestoreTimestamp } from '@/test-utils'

describe('analyticsProcessor', () => {
  describe('processAnalyticsData', () => {
    it('should process empty data array', () => {
      const result = processAnalyticsData([])

      expect(result.weeklyVisits).toHaveLength(7)
      expect(result.monthlyVisits).toHaveLength(12)
      expect(result.cvDownloads).toHaveLength(12)
      expect(result.sectionInteractions).toEqual([])
      expect(result.geographicLocation).toEqual([])
    })

    it('should count weekly visits correctly', () => {
      const data = [
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')), // Monday
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T14:00:00Z')), // Monday
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-16T10:00:00Z')), // Tuesday
        },
      ]

      const result = processAnalyticsData(data)

      // Monday is index 1, Tuesday is index 2
      expect(result.weeklyVisits[1].visits).toBe(2) // Monday
      expect(result.weeklyVisits[2].visits).toBe(1) // Tuesday
    })

    it('should count monthly visits correctly', () => {
      const data = [
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')), // January
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-02-15T10:00:00Z')), // February
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-02-20T10:00:00Z')), // February
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.monthlyVisits[0].visits).toBe(1) // January (index 0)
      expect(result.monthlyVisits[1].visits).toBe(2) // February (index 1)
    })

    it('should track CV downloads by month', () => {
      const data = [
        {
          eventType: 'cv_download',
          language: 'es',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')),
          location: { country: 'Colombia', city: 'Bogotá' },
        },
        {
          eventType: 'cv_download',
          language: 'en',
          timestamp: createFirestoreTimestamp(new Date('2024-01-20T10:00:00Z')),
          location: { country: 'USA', city: 'New York' },
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.cvDownloads[0].downloads).toBe(2) // January
      expect(result.cvDownloadDetails).toHaveLength(2)
      expect(result.cvDownloadDetails[0].language).toBe('en') // Most recent first
      expect(result.cvDownloadDetails[1].language).toBe('es')
    })

    it('should track CV download details with location and language', () => {
      const data = [
        {
          eventType: 'cv_download',
          language: 'es',
          timestamp: createFirestoreTimestamp(new Date('2024-03-15T10:00:00Z')),
          location: { country: 'Colombia', city: 'Bogotá' },
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.cvDownloadDetails[0]).toMatchObject({
        country: 'Colombia',
        city: 'Bogotá',
        language: 'es',
        month: 2, // March is index 2
        monthName: 'Mar',
      })
    })

    it('should handle missing location data in CV downloads', () => {
      const data = [
        {
          eventType: 'cv_download',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')),
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.cvDownloadDetails[0].country).toBe('Unknown')
      expect(result.cvDownloadDetails[0].city).toBe('Unknown')
      expect(result.cvDownloadDetails[0].language).toBe('Unknown')
    })

    it('should aggregate section interactions', () => {
      const data = [
        {
          eventType: 'page_view_specific_section',
          section: 'about',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')),
        },
        {
          eventType: 'page_view_specific_section',
          section: 'about',
          timestamp: createFirestoreTimestamp(new Date('2024-01-16T10:00:00Z')),
        },
        {
          eventType: 'page_view_specific_section',
          section: 'projects',
          timestamp: createFirestoreTimestamp(new Date('2024-01-17T10:00:00Z')),
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.sectionInteractions).toHaveLength(2)
      expect(result.sectionInteractions).toContainEqual({ section: 'about', interactions: 2 })
      expect(result.sectionInteractions).toContainEqual({ section: 'projects', interactions: 1 })
    })

    it('should ignore empty section names', () => {
      const data = [
        {
          eventType: 'page_view_specific_section',
          section: '',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')),
        },
        {
          eventType: 'page_view_specific_section',
          section: 'about',
          timestamp: createFirestoreTimestamp(new Date('2024-01-16T10:00:00Z')),
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.sectionInteractions).toHaveLength(1)
      expect(result.sectionInteractions[0].section).toBe('about')
    })

    it('should aggregate geographic locations', () => {
      const data = [
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')),
          location: { country: 'Colombia' },
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-16T10:00:00Z')),
          location: { country: 'Colombia' },
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-17T10:00:00Z')),
          location: { country: 'USA' },
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.geographicLocation).toHaveLength(2)
      expect(result.geographicLocation).toContainEqual({ country: 'Colombia', visits: 2 })
      expect(result.geographicLocation).toContainEqual({ country: 'USA', visits: 1 })
    })

    it('should track visits by year and month', () => {
      const data = [
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')),
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-20T10:00:00Z')),
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2023-12-15T10:00:00Z')),
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.monthlyVisitsByYear[2024][0]).toBe(2) // January 2024
      expect(result.monthlyVisitsByYear[2023][11]).toBe(1) // December 2023
    })

    it('should handle Date objects and Firestore timestamps', () => {
      const data = [
        {
          eventType: 'page_view',
          timestamp: new Date('2024-01-15T10:00:00Z'), // Regular Date object
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-16T10:00:00Z')), // Firestore timestamp
        },
      ]

      const result = processAnalyticsData(data)

      expect(result.monthlyVisits[0].visits).toBe(2) // Both should be counted
    })

    it('should calculate week of month correctly', () => {
      const data = [
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-01T10:00:00Z')), // First day of month
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-15T10:00:00Z')), // Middle of month
        },
        {
          eventType: 'page_view',
          timestamp: createFirestoreTimestamp(new Date('2024-01-31T10:00:00Z')), // Last day of month
        },
      ]

      const result = processAnalyticsData(data)

      // Verify weeklyVisitsByYearMonth structure exists
      expect(result.weeklyVisitsByYearMonth[2024]).toBeDefined()
      expect(result.weeklyVisitsByYearMonth[2024][0]).toBeDefined() // January
    })
  })
})
