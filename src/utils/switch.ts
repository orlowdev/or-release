import type { Unary } from '../types/common-types'
import { isFunction } from './guards'

type Unpack<T> = T extends Array<infer U> ? U : T

export interface ISwitchStatic {
	of: <TResult extends any[] = [], TContext = any>(x: TContext) => ISwitch<TContext, TResult>
}

export interface ISwitch<TContext, TResult extends any[]> {
	case: <TNewResult>(
		predicate: TContext | Unary<TContext, boolean>,
		onTrue: TNewResult,
	) => ISwitch<TContext, [Unpack<TResult>, TNewResult]>
	default: <TDefaultResult>(defaultValue: TDefaultResult) => Unpack<TResult> | TDefaultResult
}

export const Switch: ISwitchStatic = {
	of: (x) => swich(x),
}

const swichMatched = <TContext, TResult extends any[] = []>(
	x: TContext,
): ISwitch<TContext, TResult> => ({
	case: () => swichMatched(x),
	default: () => x as any,
})

const swich = <TContext, TResult extends any[] = []>(x: TContext): ISwitch<TContext, TResult> => ({
	case: (predicate, onTrue) => {
		const isTrue = isFunction(predicate) ? predicate(x) : (predicate as any) === x
		return isTrue ? swichMatched(onTrue) : (swich(x) as any)
	},
	default: (defaultValue) => defaultValue,
})
