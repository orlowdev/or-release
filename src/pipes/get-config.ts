import type { IAppCtx } from '../types/app-ctx'
import { transformCase } from '@priestine/case-transformer'
import { isInteger, isFloat, isBoolean } from '../utils/guards'
import { Switch } from '../utils/switch'

const normalizeConfigValue = <T>(newValue: string, currentValue: T) =>
	Switch.of(currentValue)
		.case(isInteger, Number.parseInt(newValue, 10))
		.case(isFloat, Number.parseFloat(newValue))
		.case(isBoolean, newValue === 'true')
		.default(newValue)

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

const mergeObjects = <T extends Record<string, any>, K extends T = T>(previous: T, next: K) =>
	Object.keys(next).reduce((result: T, key: keyof T) => {
		if (typeof previous[key] === 'undefined') {
			return result
		}

		result[key] = normalizeConfigValue(next[key], previous[key]) as any

		return result
	}, previous)

interface IGetConfigFromArgvDeps {
	argv: string[]
}

export const getConfigFromArgv = ({ argv }: IGetConfigFromArgvDeps) => (ctx: IAppCtx) =>
	mergeObjects(ctx, argvToObject(argv))
