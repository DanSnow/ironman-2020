import React, { useEffect, useState } from 'react'
import { useStore, useSelector } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { noop } from '../../utils'
import { pageSelector } from '../slices/record'

export function Page({ component: Component, getInitialProps = noop }) {
  const route = useRouteMatch()
  const currentPage = useSelector((state) => state.__record.currentPage)
  const actions = useSelector((state) => pageSelector(state, route.path))
  const [ready, setReady] = useState(typeof actions !== 'undefined')
  const store = useStore()

  if (actions && route.path !== currentPage) {
    for (const action of actions) {
      store.dispatch(action)
    }
  }

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
