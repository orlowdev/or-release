import { IEither, Either } from '../../utils/either'
import type { IAppCtx } from '../../types/app-ctx'
import type { Unary } from 'types/common-types'
import { Switch } from '../../utils/switch'
import * as YAML from 'yaml'
import * as TOML from 'toml'
import { resolve } from 'path'

interface IGetConfigFromFileDeps {
	readFileEither: Unary<string, IEither<string, Error>>
}

export const getConfigFromFile = ({ readFileEither }: IGetConfigFromFileDeps) => (
	ctx: IAppCtx,
): any =>
	Either.fromNullable(ctx.configFile)
		.chain(() =>
			readFileEither(getAbsolutePath(ctx.configFile)).map(
				Switch.of(ctx.configFile)
					.case((x) => /\.ya?ml$/.test(x), YAML.parse)
					.case((x) => x.endsWith('.json'), JSON.parse)
					.case((x) => x.endsWith('.toml'), TOML.parse)
					.default(() => ctx),
			),
		)
		.fold(() => ({}), mergeObjects(ctx))

// ------------------------------------------------------------------------------------------------

const getAbsolutePath = (path: string) => resolve(process.cwd(), path)

const mergeObjects = <T extends Record<string, any>, K extends Partial<T> = T>(previous: T) => (
	next: K,
) =>
	Object.keys(next).reduce((result: T, key: keyof T) => {
		if (typeof previous[key] === 'undefined') {
			return result
		}

		result[key] = next[key] as any

		return result
	}, previous)
