import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notion to D3.js Converter',
  description: 'Interactive D3.js visualization of Notion database hierarchies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <a
          href="https://github.com/rodbastos/notion-d3"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 text-sm text-gray-500 hover:text-gray-700"
        >
          Made with ❤️ by T3
        </a>
      </body>
    </html>
  )
} 