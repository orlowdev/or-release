import type { Unary } from '../types/common-types'
import { hex } from 'chalk'

// TODO: Move log to index.ts
const log = <T>(applyColor: Unary<T, string>) => (message: T): void =>
	console.log(applyColor(message))

export const red = hex('ef476f')
export const orange = hex('ff958c')
export const blue = hex('5386e4')
export const green = hex('04f06a')

export const errorPrefix = <T>(message: T) => `${red.inverse(' ERROR   ')} ${String(message)}`
export const warningPrefix = <T>(message: T) => `${orange.inverse(' WARNING ')} ${String(message)}`
export const infoPrefix = <T>(message: T) => `${blue.inverse(' INFO    ')} ${String(message)}`
export const successPrefix = <T>(message: T) => `${green.inverse(' SUCCESS ')} ${String(message)}`

export const error = log(errorPrefix)
export const warning = log(warningPrefix)
export const info = log(infoPrefix)
export const success = log(successPrefix)

export interface ILogger {
	red: Unary<string>
	orange: Unary<string>
	blue: Unary<string>
	green: Unary<string> // TODO: Move colors to a separate thing
	error: Unary<string, void>
	warning: Unary<string, void>
	info: Unary<string, void>
	success: Unary<string, void>
}
