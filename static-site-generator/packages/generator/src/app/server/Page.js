import React from 'react'
import { useRouteMatch } from 'react-router-dom'
import { useQuery } from '@apollo/client'

export function Page({ query, component: Component }) {
  const route = useRouteMatch()
  let pageData
  if (query) {
    const { data } = useQuery(query, { variables: route.params })
    pageData = data
  }

  return <Component data={pageData} />
}
