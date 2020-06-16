import type { Unary } from '../types/common-types'

export const errorPrefix = <T>(message: T) => `💣 ${String(message)}`
export const warningPrefix = <T>(message: T) => `🤔 ${String(message)}`
export const infoPrefix = <T>(message: T) => `   ${String(message)}`
export const successPrefix = <T>(message: T) => `🎉 ${String(message)}`

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
