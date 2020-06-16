import { transformCase } from '@priestine/case-transformer'
import { IAppCtx } from '../types/app-ctx'

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

interface IGetConfigFromArgvDeps {
	argv: string[]
}

const mergeObjects = <T extends Record<string, any>, K extends T = T>(previous: T, next: K) =>
	Object.keys(next).reduce((result: T, key: keyof T) => {
		if (typeof previous[key] === 'undefined') {
			return result
		}

		result[key] = next[key]

		return result
	}, previous)

export const getConfigFromArgv = ({ argv }: IGetConfigFromArgvDeps) => (ctx: IAppCtx) =>
	mergeObjects(ctx, argvToObject(argv))
