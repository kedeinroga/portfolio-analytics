import React from 'react'
import { screen } from '@testing-library/react'
import { render } from '@/test-utils'
import { Footer } from '../footer'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Github: () => <svg data-testid="github-icon" />,
  Linkedin: () => <svg data-testid="linkedin-icon" />,
}))

describe('Footer', () => {
  it('should render without crashing', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('should display the current year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument()
  })

  it('should display the author name', () => {
    render(<Footer />)
    expect(screen.getByText(/Kedein Rodriguez Gatica/)).toBeInTheDocument()
  })

  it('should render GitHub link with correct href', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /GitHub Profile/i })
    expect(githubLink).toHaveAttribute('href', 'https://github.com/kedeinroga')
  })

  it('should render LinkedIn link with correct href', () => {
    render(<Footer />)
    const linkedinLink = screen.getByRole('link', { name: /LinkedIn Profile/i })
    expect(linkedinLink).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/kedein-rodriguez-gatica/'
    )
  })

  it('should open social links in a new tab', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /GitHub Profile/i })
    const linkedinLink = screen.getByRole('link', { name: /LinkedIn Profile/i })
    expect(githubLink).toHaveAttribute('target', '_blank')
    expect(linkedinLink).toHaveAttribute('target', '_blank')
  })

  it('should have noopener noreferrer on external links', () => {
    render(<Footer />)
    const githubLink = screen.getByRole('link', { name: /GitHub Profile/i })
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should render GitHub and LinkedIn icons', () => {
    render(<Footer />)
    expect(screen.getByTestId('github-icon')).toBeInTheDocument()
    expect(screen.getByTestId('linkedin-icon')).toBeInTheDocument()
  })
})
