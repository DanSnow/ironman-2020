import { join } from 'path'
import { format } from 'prettier'

export function generateRoutes(routes) {
  const routesInfo = routes.map(({ file, url, routeProps, props }) => ({
    file,
    url,
    routeProps,
    props,
    name: `_${url.replace(/[/:]/g, '_')}`,
  }))
  return format(
    `
  import {React, Switch, Route, Page} from 'generator'
  ${routesInfo.map(({ file, name }) => `import * as ${name} from  '${join('..', file)}'`).join('\n')}

  export default function Routes() {
    return (
      <Switch>
        ${routesInfo
          .map(
            ({ routeProps, name }) =>
              `<Route key="${routeProps.path}" path="${routeProps.path}" exact={${routeProps.exact}} >
                <Page component={${name}.default} getInitialProps={${name}.getInitialProps} query={${name}.query} />
               </Route>`
          )
          .join('\n')}
      </Switch>
    )
  }

  `,
    { parser: 'babel' }
  )
}
