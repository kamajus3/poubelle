import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Bounce, ToastContainer } from 'react-toastify'

import contants from '@/constants'
import AuthProvider from '@/contexts/AuthContext'
import CampaignProvider from '@/contexts/CampaignContext'
import InformationProvider from '@/contexts/InformationContext'

import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '700'],
})

export const viewport: Viewport = {
  themeColor: contants.colors.main,
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://raciuscare.com'),
  title: {
    template: '%s | Racius Care',
    default: 'Racius Care',
  },
  description:
    'Bem-vindo à Racius Care - sua loja online para cuidados pessoais, saúde, e produtos para casa em Angola. Encontre tudo o que você precisa para cuidar de si mesmo, sua família e sua casa, com apenas alguns cliques.',
  generator: 'Next.js',
  applicationName: 'Racius Care',
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'Racius Care', url: 'https://raciuscare.com' }],
  creator: 'Racius Care Developers',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: 'https://raciuscare.com',
    languages: {
      'pt-PT': '/pt-PT',
      'pt-BR': '/pt-BR',
    },
  },
  openGraph: {
    title: 'Racius Care',
    description:
      'Bem-vindo à Racius Care - sua loja online para cuidados pessoais, saúde, e produtos para casa em Angola. Encontre tudo o que você precisa para cuidar de si mesmo, sua família e sua casa, com apenas alguns cliques.',
    images: ['https://raciuscare.com/logo.png'],
  },
  twitter: {
    title: 'Racius Care',
    description:
      'Bem-vindo à Racius Care - sua loja online para cuidados pessoais, saúde, e produtos para casa em Angola. Encontre tudo o que você precisa para cuidar de si mesmo, sua família e sua casa, com apenas alguns cliques.',
    images: ['https://raciuscare.com/logo.png'],
  },
  icons: {
    icon: ['/favicon.ico?v=4'],
    apple: ['apple-touch-icon.png?v=4'],
    shortcut: ['apple-touch-icon.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt">
      <body className={`${inter.className}`}>
        <AuthProvider>
          <CampaignProvider>
            <InformationProvider>{children}</InformationProvider>
          </CampaignProvider>
        </AuthProvider>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover={false}
          theme="light"
          transition={Bounce}
        />
      </body>
    </html>
  )
}
