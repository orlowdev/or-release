import type { Unary } from '../types/common-types'

export const isFunction = (x: any): x is Unary<any> => typeof x === 'function'

export const isInteger = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)

export const isFloat = (x: unknown): x is number => typeof x === 'number' && !Number.isInteger(x)

export const isBoolean = (x: unknown): x is boolean => typeof x === 'boolean'
