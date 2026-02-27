import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test-utils'
import { SectionTracker } from '../section-tracker'

// Mock the analytics function
jest.mock('@/lib/analytics', () => ({
  logPageViewSpecificSection: jest.fn(),
}))

// Mock useOnScreen hook
jest.mock('@/hooks/use-on-screen', () => ({
  useOnScreen: jest.fn(),
}))

import { logPageViewSpecificSection } from '@/lib/analytics'
import { useOnScreen } from '@/hooks/use-on-screen'

const mockLogSection = logPageViewSpecificSection as jest.Mock
const mockUseOnScreen = useOnScreen as jest.Mock

describe('SectionTracker', () => {
  beforeEach(() => {
    mockUseOnScreen.mockReturnValue(false)
    mockLogSection.mockClear()
  })

  it('should render children', () => {
    render(
      <SectionTracker sectionName="about">
        <p>About content</p>
      </SectionTracker>
    )
    expect(screen.getByText('About content')).toBeInTheDocument()
  })

  it('should render a <section> element', () => {
    const { container } = render(
      <SectionTracker sectionName="skills">
        <span>Content</span>
      </SectionTracker>
    )
    expect(container.querySelector('section')).toBeInTheDocument()
  })

  it('should apply id prop to section element', () => {
    const { container } = render(
      <SectionTracker sectionName="projects" id="projects-section">
        <span>Projects</span>
      </SectionTracker>
    )
    const section = container.querySelector('section')
    expect(section).toHaveAttribute('id', 'projects-section')
  })

  it('should apply className prop', () => {
    const { container } = render(
      <SectionTracker sectionName="experience" className="my-section-class">
        <span>Experience</span>
      </SectionTracker>
    )
    const section = container.querySelector('section')
    expect(section).toHaveClass('my-section-class')
  })

  it('should NOT log analytics when section is not visible', () => {
    mockUseOnScreen.mockReturnValue(false)
    render(
      <SectionTracker sectionName="contact">
        <p>Contact</p>
      </SectionTracker>
    )
    expect(mockLogSection).not.toHaveBeenCalled()
  })

  it('should log analytics once when section becomes visible', async () => {
    mockUseOnScreen.mockReturnValue(true)
    render(
      <SectionTracker sectionName="about">
        <p>About</p>
      </SectionTracker>
    )
    await waitFor(() => {
      expect(mockLogSection).toHaveBeenCalledTimes(1)
      expect(mockLogSection).toHaveBeenCalledWith('about')
    })
  })

  it('should NOT log analytics again if re-rendered while visible', async () => {
    mockUseOnScreen.mockReturnValue(true)
    const { rerender } = render(
      <SectionTracker sectionName="skills">
        <p>Skills</p>
      </SectionTracker>
    )
    await waitFor(() => {
      expect(mockLogSection).toHaveBeenCalledTimes(1)
    })
    // Re-render while still visible
    rerender(
      <SectionTracker sectionName="skills">
        <p>Skills updated</p>
      </SectionTracker>
    )
    // Should still be 1
    expect(mockLogSection).toHaveBeenCalledTimes(1)
  })

  it('should call useOnScreen with -30% rootMargin', () => {
    render(
      <SectionTracker sectionName="projects">
        <p>Projects</p>
      </SectionTracker>
    )
    expect(mockUseOnScreen).toHaveBeenCalledWith(
      expect.objectContaining({ current: expect.anything() }),
      '-30%'
    )
  })
})
