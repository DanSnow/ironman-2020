import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'generator'

export function Layout({ title = 'My Blog', children }) {
  const isHome = useLocation().pathname === '/'

  return (
    <div className="max-w-screen-sm mx-auto">
      <Helmet>
        <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet" />
      </Helmet>
      <header>
        <Link to="/">
          {isHome ? (
            <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
          ) : (
            <h3 className="text-3xl text-center font-bold mb-8">{title}</h3>
          )}
        </Link>
        <nav>
          <ul className="flex border-b w-full px-4">
            <li>
              <Link to="/about" className="text-teal-600">
                About
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="mt-4">{children}</main>
    </div>
  )
}
