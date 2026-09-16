import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { render } from '@/test-utils'
import { Tools } from '../tools'
import { logToolOpen } from '@/lib/analytics'

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  logToolOpen: jest.fn(),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => <svg data-testid="arrow-icon" />,
  CalendarCheck: () => <svg data-testid="calendar-icon" />,
  TrendingDown: () => <svg data-testid="trending-icon" />,
}))

describe('Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the section heading', () => {
    render(<Tools />)
    expect(screen.getByRole('heading', { name: /Tools/i })).toBeInTheDocument()
  })

  it('should render one card per tool', () => {
    render(<Tools />)
    expect(screen.getByText('Loan Simulator')).toBeInTheDocument()
    expect(screen.getByText('Deadline Calculator')).toBeInTheDocument()
  })

  it('should link each tool to its internal route', () => {
    render(<Tools />)
    const links = screen.getAllByRole('link')
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      '/finanzas',
      '/calculadora',
    ])
  })

  it('should not open tool links in a new tab', () => {
    render(<Tools />)
    screen.getAllByRole('link').forEach(link => {
      expect(link).not.toHaveAttribute('target')
    })
  })

  it('should render an icon for each tool', () => {
    render(<Tools />)
    expect(screen.getByTestId('trending-icon')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
  })

  it('should track the tool that was opened', () => {
    render(<Tools />)
    fireEvent.click(screen.getAllByRole('link')[0])
    expect(logToolOpen).toHaveBeenCalledWith('finanzas')
  })

  it('should track each tool separately', () => {
    render(<Tools />)
    fireEvent.click(screen.getAllByRole('link')[1])
    expect(logToolOpen).toHaveBeenCalledWith('calculadora')
    expect(logToolOpen).toHaveBeenCalledTimes(1)
  })
})
