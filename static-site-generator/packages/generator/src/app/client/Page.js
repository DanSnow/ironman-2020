import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { pageSelector, __record } from '../slices/record'
import { join } from 'path'
import { ApolloConsumer } from '@apollo/client'

function withApollo(Component) {
  const Wrapped = function (props) {
    return <ApolloConsumer>{(client) => <Component client={client} {...props} />}</ApolloConsumer>
  }
  Wrapped.displayName = `withApollo(${Component.displayName || Component.name || 'Anonymous'})`
  return Wrapped
}

const PageComponent = function ({ component: Component, query, client }) {
  const route = useRouteMatch()
  const [gqlData, setData] = useState(readQuery({ client, query, variables: route.params }))
  const currentPage = useSelector((state) => state.__record.currentPage)
  const actions = useSelector((state) => pageSelector(state, route.url))
  const dispatch = useDispatch()

  useEffect(() => {
    if (!actions) {
      loadPayload(route.url)
    }
    if (query && !gqlData) {
      const observableQuery = client.watchQuery({
        query,
        errorPolicy: 'ignore',
        fetchPolicy: 'cache-only',
        variables: route.params,
      })

      observableQuery.result().then(({ data }) => {
        setData(data)
      })
    }
  }, [gqlData, actions, route, query])

  if (actions) {
    if (route.path !== currentPage) {
      for (const action of actions) {
        dispatch(action)
      }
      setTimeout(() => {
        dispatch(__record.actions.setCurrentPage(route.url))
      }, 0)
    }
  } else {
    return null
  }

  if (!gqlData && query) {
    return null
  }

  return <Component data={gqlData} />
}

PageComponent.displayName = 'Page'

export const Page = withApollo(PageComponent)

function readQuery({ client, query, variables }) {
  if (query) {
    try {
      return client.readQuery({
        query,
        variables,
      })
    } catch {}
  }
}

function loadPayload(url) {
  const $script = document.createElement('script')
  $script.src = join(url, 'payload.js')
  document.head.append($script)
}
