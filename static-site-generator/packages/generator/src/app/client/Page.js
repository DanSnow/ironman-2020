import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouteMatch } from 'react-router-dom'
import { pageSelector, __record } from '../slices/record'
import { join } from 'path'

export function Page({ component: Component }) {
  const route = useRouteMatch()
  const currentPage = useSelector((state) => state.__record.currentPage)
  const actions = useSelector((state) => pageSelector(state, route.url))
  const dispatch = useDispatch()

  useEffect(() => {
    if (!actions) {
      loadPayload(route.url)
    }
  }, [actions, route])

  if (actions) {
    if (route.path !== currentPage) {
      for (const action of actions) {
        dispatch(action)
      }
      dispatch(__record.actions.setCurrentPage(route.url))
    }
  } else {
    return null
  }

  return <Component />
}

function loadPayload(url) {
  const $script = document.createElement('script')
  $script.src = join(url, 'payload.js')
  document.head.append($script)
}
