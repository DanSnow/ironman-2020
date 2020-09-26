export function noop() {}

export function findFirstMap(array, mapper) {
  for (const item of array) {
    const mapped = mapper(item)
    if (mapped != null) {
      return mapped
    }
  }
}
