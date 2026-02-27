import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render } from '@/test-utils'
import { Header } from '../header'

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  logCvDownload: jest.fn(),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Download: () => <svg data-testid="download-icon" />,
  Github: () => <svg data-testid="github-icon" />,
  Linkedin: () => <svg data-testid="linkedin-icon" />,
  Menu: () => <svg data-testid="menu-icon" />,
  Globe: () => <svg data-testid="globe-icon" />,
}))

describe('Header', () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
  })

  it('should render without crashing', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('should render the KRG logo link', () => {
    render(<Header />)
    const logo = screen.getByRole('link', { name: /KRG/i })
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('href', '/')
  })

  it('should render navigation links in desktop nav', () => {
    render(<Header />)
    // Nav links are visible on desktop
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('should render Download CV button', () => {
    render(<Header />)
    // There may be multiple (desktop + mobile)
    const downloadButtons = screen.getAllByTestId('download-icon')
    expect(downloadButtons.length).toBeGreaterThan(0)
  })

  it('should render language switcher globe button', () => {
    render(<Header />)
    const globeIcons = screen.getAllByTestId('globe-icon')
    expect(globeIcons.length).toBeGreaterThan(0)
  })

  it('should start with transparent background when not scrolled', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('bg-transparent')
  })

  it('should add scrolled classes when window scrolls', async () => {
    render(<Header />)
    const header = screen.getByRole('banner')

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true })
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(header).toHaveClass('bg-background/80')
    })
  })

  it('should render mobile menu trigger button', () => {
    render(<Header />)
    const menuIcon = screen.getByTestId('menu-icon')
    expect(menuIcon).toBeInTheDocument()
  })

  it('should call logCvDownload when CV download button is clicked', async () => {
    const { logCvDownload } = require('@/lib/analytics')
    render(<Header />)

    // Find the download CV link in desktop nav
    const downloadLinks = screen.getAllByRole('link', { name: /download cv/i })
    fireEvent.click(downloadLinks[0])

    await waitFor(() => {
      expect(logCvDownload).toHaveBeenCalled()
    })
  })
})
