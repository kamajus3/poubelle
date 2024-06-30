'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

import { useAuth } from '@/hooks/useAuth'

export default function Avatar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <div>
      <p className="text-sm px-4 py-2 text-gray-800 border-b">
        Logado em <strong>{user?.email}</strong>
      </p>
      <Link
        href="/admin/dashboard"
        className={clsx(
          'hidden text-sm px-4 py-2 text-gray-800 hover:bg-gray-200 max-sm:block',
          {
            'bg-main text-white hover:bg-main': pathname === '/admin/dashboard',
          },
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/products"
        className={clsx(
          'hidden text-sm px-4 py-2 text-gray-800 hover:bg-gray-200 max-sm:block',
          {
            'bg-main text-white hover:bg-main': pathname === '/admin/products',
          },
        )}
      >
        Produtos
      </Link>
      <Link
        href="/admin/orders"
        className={clsx(
          'hidden text-sm px-4 py-2 text-gray-800 hover:bg-gray-200 max-sm:block',
          {
            'bg-main text-white hover:bg-main': pathname === '/admin/orders',
          },
        )}
      >
        Pedidos
      </Link>
      <Link
        href="/admin/campaigns"
        className={clsx(
          'hidden text-sm px-4 py-2 text-gray-800 hover:bg-gray-200 max-sm:block',
          {
            'bg-main text-white hover:bg-main': pathname === '/admin/campaigns',
          },
        )}
      >
        Minhas campanhas
      </Link>
      <Link
        href="/logout"
        className="block text-sm px-4 py-2 text-gray-800 hover:bg-gray-200"
      >
        Terminar sessão
      </Link>
    </div>
  )
}
