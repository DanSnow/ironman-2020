export default {
  title: 'My Blog',

  sources: [
    {
      name: 'Article',
      source: './articles',
      transform: ({ slug, ...rest }) => ({ id: slug, slug, ...rest }),
    },
  ],
}
