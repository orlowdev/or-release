import type { IAppCtx } from '../types/app-ctx'
import { isInteger, isFloat, isBoolean } from '../utils/guards'
import { Switch } from '../utils/switch'

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
