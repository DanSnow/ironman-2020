import React, { useEffect, useState } from 'react'
import { useStore } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { noop } from '../../utils'

let first = true

export function Page({ component: Component, getInitialProps = noop }) {
  const [ready, setReady] = useState(first)
  const route = useRouteMatch()
  const store = useStore()
  first = false

  useEffect(() => {
    const fetch = async () => {
      await getInitialProps({ route, store })
      setReady(true)
    }

    if (!ready) {
      fetch()
    }
  }, [getInitialProps, ready])

  if (ready) {
    return <Component />
  }

  return null
}
