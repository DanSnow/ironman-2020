import { resolve } from 'path'
import { Bundler } from './bundler'

async function main() {
  const bundler = new Bundler(resolve(__dirname, '../example/index.js'), resolve(__dirname, '../example'))

  await bundler.execute()
  console.log(bundler.generate())
}

main()
