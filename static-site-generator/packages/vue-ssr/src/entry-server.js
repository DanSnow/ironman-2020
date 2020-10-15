import { createApp } from './app'

export default (path, context) => {
  return new Promise((resolve) => {
    const { app, store, router } = createApp()
    router.push(path)
    router.onReady(() => {
      context.rendered = () => {
        context.state = store.state
      }
      resolve(app)
    })
  })
}
