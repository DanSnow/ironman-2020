const { Linter, RuleTester } = require('eslint')
const rule = require('./space-between-properties')
const dedent = require('ts-dedent').default

const linter = new Linter()

const id = 'space-between-properties'
linter.defineRule(id, rule)

const res = linter.verify(
  `
export default {
  name: 'Foo',
  props: {},
}
`,

  {
    rules: {
      [id]: 'error',
    },
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2015,
    },
  }
)

if (res.length) {
  console.log(res)
}

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2015,
  },
})

ruleTester.run(id, rule, {
  valid: [
    {
      code: `
        export default {
          name: 'Foo',

          props: {},
        }
        `,
    },
    {
      code: `
        export default {
          name: 'Foo',

          props: {
            foo: Boolean,
            bar: String,
          },
        }
        `,
    },
  ],

  invalid: [
    {
      code: dedent`export default {
          name: 'Foo',
          props: {},
        }`,
      errors: [
        {
          messageId: 'requireNewline',
        },
      ],
      output: dedent`export default {
          name: 'Foo',

          props: {},
        }`,
    },
  ],
})
