import './globals.css'
import { ResourceProvider } from './contexts/ResourceContext'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ResourceProvider>
          {children}
        </ResourceProvider>
      </body>
    </html>
  )
}
