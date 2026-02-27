import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/test-utils'
import { FadeIn } from '../fade-in'

// Mock useOnScreen hook
jest.mock('@/hooks/use-on-screen', () => ({
  useOnScreen: jest.fn(),
}))

import { useOnScreen } from '@/hooks/use-on-screen'
const mockUseOnScreen = useOnScreen as jest.Mock

describe('FadeIn', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render children', () => {
    mockUseOnScreen.mockReturnValue(false)
    render(
      <FadeIn>
        <p>Hello World</p>
      </FadeIn>
    )
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('should start with hidden state when not visible', () => {
    mockUseOnScreen.mockReturnValue(false)
    const { container } = render(
      <FadeIn>
        <span>Content</span>
      </FadeIn>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('opacity-0')
    expect(wrapper).toHaveClass('translate-y-4')
  })

  it('should show content when visible', () => {
    mockUseOnScreen.mockReturnValue(true)
    const { container } = render(
      <FadeIn>
        <span>Content</span>
      </FadeIn>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('opacity-100')
    expect(wrapper).toHaveClass('translate-y-0')
  })

  it('should apply transition classes', () => {
    mockUseOnScreen.mockReturnValue(false)
    const { container } = render(
      <FadeIn>
        <span>Content</span>
      </FadeIn>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('transition-all')
    expect(wrapper).toHaveClass('duration-700')
  })

  it('should apply custom className', () => {
    mockUseOnScreen.mockReturnValue(false)
    const { container } = render(
      <FadeIn className="my-custom-class">
        <span>Content</span>
      </FadeIn>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('my-custom-class')
  })

  it('should call useOnScreen with -100px rootMargin', () => {
    mockUseOnScreen.mockReturnValue(false)
    render(
      <FadeIn>
        <span>Content</span>
      </FadeIn>
    )
    expect(mockUseOnScreen).toHaveBeenCalledWith(
      expect.objectContaining({ current: expect.anything() }),
      '-100px'
    )
  })

  it('should render a div wrapper', () => {
    mockUseOnScreen.mockReturnValue(false)
    const { container } = render(
      <FadeIn>
        <span>Text</span>
      </FadeIn>
    )
    expect(container.firstChild?.nodeName).toBe('DIV')
  })
})
