/**
 * Tests for calculator date logic
 * Extracted from calculadora/page.tsx for unit testing
 */

describe('Calculator Date Logic', () => {
  // Helper function extracted from the component
  const calculateDate = (startStr: string, daysToAdd: number): Date => {
    const [y, m, d] = startStr.split('-').map(Number)
    const resultDate = new Date(y, m - 1, d)
    resultDate.setDate(resultDate.getDate() + daysToAdd)
    return resultDate
  }

  describe('calculateDate', () => {
    it('should add days correctly within same month', () => {
      const result = calculateDate('2024-01-15', 10)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(25)
    })

    it('should handle month boundary crossing', () => {
      const result = calculateDate('2024-01-25', 10)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(4)
    })

    it('should handle year boundary crossing', () => {
      const result = calculateDate('2024-12-25', 10)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(4)
    })

    it('should handle leap year February correctly', () => {
      // 2024 is a leap year
      const result = calculateDate('2024-02-28', 1)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(29) // Leap day
    })

    it('should handle non-leap year February correctly', () => {
      // 2023 is not a leap year
      const result = calculateDate('2023-02-28', 1)
      expect(result.getFullYear()).toBe(2023)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(1)
    })

    it('should handle adding from leap day', () => {
      const result = calculateDate('2024-02-29', 1)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(1)
    })

    it('should handle large day additions', () => {
      const result = calculateDate('2024-01-01', 365)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(11) // December (2024 is leap year)
      expect(result.getDate()).toBe(31)
    })

    it('should handle typical legal deadlines (25 days)', () => {
      const result = calculateDate('2024-01-01', 25)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(26)
    })

    it('should handle typical legal deadlines (50 days)', () => {
      const result = calculateDate('2024-01-01', 50)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(1) // February
      expect(result.getDate()).toBe(20)
    })

    it('should handle typical legal deadlines (75 days)', () => {
      const result = calculateDate('2024-01-01', 75)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(16)
    })

    it('should handle end of month edge cases', () => {
      // January 31 + 1 month should be Feb 28/29
      const result = calculateDate('2024-01-31', 31)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(2) // March
      expect(result.getDate()).toBe(2)
    })

    it('should handle zero days', () => {
      const result = calculateDate('2024-01-15', 0)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(15)
    })

    it('should handle single day addition', () => {
      const result = calculateDate('2024-01-15', 1)
      expect(result.getFullYear()).toBe(2024)
      expect(result.getMonth()).toBe(0) // January
      expect(result.getDate()).toBe(16)
    })
  })

  describe('Date formatting for display', () => {
    it('should format dates in Spanish locale', () => {
      const date = new Date('2024-01-15T10:00:00Z')
      const formatted = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      expect(formatted).toContain('2024')
      expect(formatted).toContain('15')
    })
  })

  describe('Days until deadline calculation', () => {
    const calculateDaysUntil = (targetDate: Date): number => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const diffTime = targetDate.getTime() - today.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    it('should calculate positive days for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      futureDate.setHours(0, 0, 0, 0)

      const days = calculateDaysUntil(futureDate)
      expect(days).toBe(5)
    })

    it('should calculate zero for today', () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const days = calculateDaysUntil(today)
      expect(days).toBe(0)
    })

    it('should calculate negative days for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)
      pastDate.setHours(0, 0, 0, 0)

      const days = calculateDaysUntil(pastDate)
      expect(days).toBe(-5)
    })
  })
})
