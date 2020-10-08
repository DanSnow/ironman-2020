import { basename, resolve } from 'path'
import { readFile } from 'fs/promises'
import globby from 'globby'
import matter from 'front-matter'
import pEach from 'p-each-series'
import mdx from '@mdx-js/mdx'
import requireString from 'require-from-string'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { transform } from '../transform'

export async function loadSource({ createNodes, options }) {
  const { name, source } = options
  await createNodes(name, async (createNode) => {
    const files = await globby(resolve(process.cwd(), source, '**/*.mdx'))
    await pEach(files, async (file) => {
      const raw = await readFile(file, 'utf-8')
      const { attributes, body } = matter(raw)
      const content = await mdx(body)
      const code = await transform(`import { mdx } from '@mdx-js/react'
        export const matter = ${JSON.stringify(attributes)}
        ${content}
        `)
      const res = requireString(code, { filename: `${basename(file)}.js` })
      const MDXContent = res.default
      const map = options.transform || ((x) => x)
      createNode(
        map({
          ...res.matter,
          content: renderToStaticMarkup(<MDXContent />),
        })
      )
    })
  })
}
