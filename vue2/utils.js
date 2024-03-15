export function isObject(obj) {
  return typeof obj === 'object' && obj !== null;
}

export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    enumerable: !!enumerable,
    configurable: true,
    writable: true,
    value: val
  })
}