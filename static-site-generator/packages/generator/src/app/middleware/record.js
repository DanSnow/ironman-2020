import { name, __record } from '../slices/record'

export function record() {
  return (next) => (action) => {
    const res = next(action)
    if (!action.type.startsWith(name)) {
      next(__record.actions.pushAction(action))
    }
    return res
  }
}
