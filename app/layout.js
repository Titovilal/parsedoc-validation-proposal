import './globals.css'
import { ResourceProvider } from './contexts/ResourceContext'
import { ThemeProvider } from './contexts/ThemeContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ResourceProvider>
            {children}
          </ResourceProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
