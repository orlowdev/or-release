import type { Unary } from '../types/common-types'
import { red, yellow, green, blue } from 'chalk'
import { errorToString } from './helpers'
import { Either } from './either'
import { Switch } from './switch'
import { isFunction } from './guards'

export interface IColorizer {
	r: Unary<any>
	y: Unary<any>
	g: Unary<any>
	b: Unary<any>
}

export type LogFunction = (
	strings: TemplateStringsArray | string,
	...values: Array<Unary<IColorizer, string> | string | number | boolean>
) => void

export type LogFatalError = Unary<string, Unary<Error, never>>
export type LogExitingWarning = Unary<string, never>

export const logInfo = logWithLevel('info')
export const logError = logWithLevel('error')
export const logWarning = logWithLevel('warning')
export const logSuccess = logWithLevel('success')

export const logFatalError = (message: string) => (error: Error) => {
	logError(message)
	logError(errorToString(error))
	return process.exit(1)
}

export const logExitingWarning = (message: string) => {
	logWarning(message)
	return process.exit(0)
}

// ------------------------------------------------------------------------------------------------

interface ILogger {
	error: Unary<string, void>
	warning: Unary<string, void>
	info: Unary<string, void>
	success: Unary<string, void>
}

const colors: IColorizer = {
	r: red,
	y: yellow,
	b: blue,
	g: green,
}

const logger: ILogger = {
	error: <T>(message: T) => console.log(`💣  ${String(message)}`),
	warning: <T>(message: T) => console.log(`🤔  ${String(message)}`),
	info: <T>(message: T) => console.log(`    ${String(message)}`),
	success: <T>(message: T) => console.log(`🎉  ${String(message)}`),
}

function logWithLevel(level: keyof ILogger): LogFunction {
	return (
		strings: TemplateStringsArray | string,
		...values: Array<Unary<IColorizer, string> | any>
	) =>
		logger[level](
			(Array.isArray(strings) ? strings : ([strings] as any[])).reduce(
				(acc, string, i) =>
					acc.concat(string).concat(
						Either.fromNullable(values[i])
							.map((value) =>
								Switch.of(value)
									.case(isFunction, () => value(colors))
									.default(() => value),
							)
							.map((f) => f())
							.fold(
								() => '',
								(x) => x,
							),
					),
				'',
			),
		)
}
