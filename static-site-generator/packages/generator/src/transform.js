import { transformAsync } from '@babel/core'
import env from '@babel/preset-env'
import react from '@babel/preset-react'

export async function transform(code) {
  const res = await transformAsync(code, {
    presets: [[env, { targets: { node: 'current' } }], react],
  })
  return res.code
}
