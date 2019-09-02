export const simpleTextFilter = filterString => (object = {}) => {
  return typeof filterString === 'string'
    ? Object.values(object)
        .toString()
        .toLowerCase()
        .includes(filterString.toLowerCase())
    : false
}
