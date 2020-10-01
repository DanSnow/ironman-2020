import { join } from 'path'
import { format } from 'prettier'

export function generateRoutes(routes) {
  const routesInfo = routes.map(({ file, url, props }) => ({
    file,
    url,
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
            ({ props, name }) =>
              `<Route path="${props.path}" exact={${props.exact}} >
                <Page component={${name}.default} getInitialProps={${name}.getInitialProps} />
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
