import type { Unary } from '../types/common-types'

export const isFunction = (x: any): x is Unary<any> => typeof x === 'function'
