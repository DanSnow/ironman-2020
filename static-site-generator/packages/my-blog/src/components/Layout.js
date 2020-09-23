import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Layout({ title, children }) {
  const isHome = useLocation().pathname === '/'

  return (
    <div className="max-w-screen-sm mx-auto">
      <header>
        <Link to="/">
          {isHome ? (
            <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
          ) : (
            <h3 className="text-3xl text-center font-bold mb-8">{title}</h3>
          )}
        </Link>
      </header>
      <main>{children}</main>
    </div>
  )
}
