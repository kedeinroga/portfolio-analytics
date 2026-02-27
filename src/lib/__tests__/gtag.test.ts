/**
 * Tests for gtag.ts - Google Analytics tracking utilities
 *
 * NOTE: GA_TRACKING_ID is read from env at module load time.
 * In the test environment NEXT_PUBLIC_GA_MEASUREMENT_ID is not set,
 * so GA_TRACKING_ID is an empty string and the tracking functions
 * return early. We test the guards AND mock the env to test the
 * actual calls.
 */

// We need to reset modules so we can control the env variable
const FAKE_GA_ID = 'G-TESTID1234'

describe('gtag', () => {
  describe('when GA_TRACKING_ID is empty (no env var)', () => {
    let gtag: typeof import('../gtag')

    beforeEach(() => {
      jest.resetModules()
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      gtag = require('../gtag')
        ; (window.gtag as jest.Mock).mockClear()
    })

    it('should export GA_TRACKING_ID as empty string when env is not set', () => {
      expect(gtag.GA_TRACKING_ID).toBe('')
    })

    it('pageview should NOT call window.gtag when GA_TRACKING_ID is empty', () => {
      gtag.pageview(new URL('https://example.com/test'))
      expect(window.gtag).not.toHaveBeenCalled()
    })

    it('event should NOT call window.gtag when GA_TRACKING_ID is empty', () => {
      gtag.event({
        action: 'test',
        category: 'test',
        label: 'test',
        value: 1,
      })
      expect(window.gtag).not.toHaveBeenCalled()
    })
  })

  describe('when GA_TRACKING_ID is set', () => {
    let gtag: typeof import('../gtag')

    beforeEach(() => {
      jest.resetModules()
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = FAKE_GA_ID
      gtag = require('../gtag')
        ; (window.gtag as jest.Mock).mockClear()
    })

    afterEach(() => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    })

    it('should export the GA_TRACKING_ID from env', () => {
      expect(gtag.GA_TRACKING_ID).toBe(FAKE_GA_ID)
    })

    it('pageview should call window.gtag with config command', () => {
      const testUrl = new URL('https://example.com/test')
      gtag.pageview(testUrl)

      expect(window.gtag).toHaveBeenCalledWith('config', FAKE_GA_ID, {
        page_path: testUrl,
      })
    })

    it('pageview should accept any URL', () => {
      const url = new URL('https://portfolio.com/calculadora')
      expect(() => gtag.pageview(url)).not.toThrow()
      expect(window.gtag).toHaveBeenCalledWith('config', FAKE_GA_ID, {
        page_path: url,
      })
    })

    it('event should call window.gtag with event command and correct data', () => {
      gtag.event({
        action: 'cv_download',
        category: 'engagement',
        label: 'cv_download_es',
        value: 1,
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'cv_download', {
        event_category: 'engagement',
        event_label: 'cv_download_es',
        value: 1,
      })
    })

    it('event should work for section view events', () => {
      gtag.event({
        action: 'view_section',
        category: 'navigation',
        label: 'about',
        value: 1,
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'view_section', {
        event_category: 'navigation',
        event_label: 'about',
        value: 1,
      })
    })

    it('event should handle value of 0', () => {
      gtag.event({
        action: 'test_action',
        category: 'test',
        label: 'test_label',
        value: 0,
      })

      expect(window.gtag).toHaveBeenCalledWith('event', 'test_action', {
        event_category: 'test',
        event_label: 'test_label',
        value: 0,
      })
    })
  })
})
