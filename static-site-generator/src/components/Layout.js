import React from 'react'

export function Layout({ title, children }) {
  return (
    <div className="max-w-screen-sm mx-auto">
      <header>
        <h1 className="text-4xl text-center font-bold mb-8">{title}</h1>
      </header>
      <main>{children}</main>
    </div>
  )
}
