import type { IAppCtx } from '../types/app-ctx'
import type { Unary } from '../types/common-types'
import type { IEither } from '../utils/either'
import { transformCase } from '@priestine/case-transformer'
import { getConfigFromFile } from '../pure/getters/get-config-from-file'
import { isBoolean, isFloat, isInteger } from '../utils/guards'
import { ExtendPipe } from '../utils/pipe'
import { Switch } from '../utils/switch'

interface IGetConfigurationPipeDeps {
	argv: string[]
	env: Record<string, string>
	readFileEither: Unary<string, IEither<string, Error>>
}

export const getConfigurationPipe = ({ argv, env, readFileEither }: IGetConfigurationPipeDeps) =>
	ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
		.pipeExtend(mergeConfig(envToObject(env)))
		.pipeExtend(mergeConfig(argvToObject(argv)))
		.pipeExtend(getConfigFromFile({ readFileEither }))
		.pipeExtend(mergeConfig(envToObject(env)))
		.pipeExtend(mergeConfig(argvToObject(argv)))

// ------------------------------------------------------------------------------------------------

const argvToObject = (argv: string[]): IAppCtx =>
	argv.reduce<any>((acc, arg) => {
		if (!arg.startsWith('--')) {
			return acc
		}

		let [key, value] = arg.includes('=') ? arg.split('=') : [arg]
		const validKey = transformCase(key.slice(2)).from.kebab.to.camel.toString()

		if (!value) {
			value = 'true'
		}

		acc[validKey] = value

		return acc
	}, {})

const envToObject = (env: NodeJS.ProcessEnv) =>
	Object.keys(env).reduce(
		(acc, key) => ({
			...acc,
			[transformCase(key.slice(19)).from.upperSnake.to.camel.toString()]: env[key],
		}),
		{},
	)

export const mergeConfig = <T extends Partial<IAppCtx>>(config: T) => (ctx: IAppCtx) =>
	mergeObjects(ctx, config)

const normalizeConfigValue = <T>(newValue: string, currentValue: T) =>
	Switch.of(currentValue)
		.case(isInteger, Number.parseInt(newValue, 10))
		.case(isFloat, Number.parseFloat(newValue))
		.case(isBoolean, newValue === 'true')
		.default(newValue)

const mergeObjects = <T extends Record<string, any>, K extends Partial<T> = T>(
	previous: T,
	next: K,
) =>
	Object.keys(next).reduce((result: T, key: keyof T) => {
		if (typeof previous[key] === 'undefined') {
			return result
		}

		result[key] = normalizeConfigValue(next[key] as any, previous[key]) as any

		return result
	}, previous)
