import type { Unary } from '../types/common-types'
import { red, green, blue, yellow } from 'chalk'

export const errorPrefix = <T>(message: T) => `${red.inverse(' ERROR   ')} ${String(message)}`
export const warningPrefix = <T>(message: T) => `${yellow.inverse(' WARNING ')} ${String(message)}`
export const infoPrefix = <T>(message: T) => `${blue.inverse(' INFO    ')} ${String(message)}`
export const successPrefix = <T>(message: T) => `${green.inverse(' SUCCESS ')} ${String(message)}`

export interface ILogger {
	error: Unary<string, void>
	warning: Unary<string, void>
	info: Unary<string, void>
	success: Unary<string, void>
}

export interface IColorizer {
	red: Unary<string>
	yellow: Unary<string>
	green: Unary<string>
	blue: Unary<string>
}
