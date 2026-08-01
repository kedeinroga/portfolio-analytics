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
