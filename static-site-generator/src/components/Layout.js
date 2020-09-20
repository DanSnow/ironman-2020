import React from 'react'

export function Layout({ location, title, children }) {
  const isHome = location.pathname === '/'

  return (
    <div className="max-w-screen-sm mx-auto">
      <header>
        <a href="/">
          {isHome ? (
            <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
          ) : (
            <h3 className="text-3xl text-center font-bold mb-8">{title}</h3>
          )}
        </a>
      </header>
      <main>{children}</main>
    </div>
  )
}
