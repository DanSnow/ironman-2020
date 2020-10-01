import webpack from 'webpack'
import config from './webpack.config'

export function bundle() {
  return new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) {
        reject(err)
        return
      }
      resolve(stats)
    })
  })
}
