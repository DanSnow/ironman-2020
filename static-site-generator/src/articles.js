import slugify from 'slugify'

export const articles = [
  {
    title: 'How to write a Static Site Generator',
    content: 'We will introduce you how to write a Static Site Generator...',
  },
  {
    title: 'First Post',
    content: 'My first post',
  },
].map((article) =>
  article.slug
    ? article
    : {
        slug: slugify(article.title, { lower: true }),
        ...article,
      }
)

export const notFound = {
  title: 'Not Found',
  content: '404 not found',
}
