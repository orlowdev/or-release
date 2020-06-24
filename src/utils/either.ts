import type { Thunk, Unary } from '../types/common-types'
import { isFunction } from './guards'

type Nullable<T> = T | null | undefined

const unsafeGet = Symbol('EitherUnsafeGet')

export interface IEitherStatic {
	try: <TSuccess, TFail>(thunk: Thunk<TSuccess>) => IEither<TSuccess, TFail>
	fromNullable: <TContext>(x: Nullable<TContext>) => IEither<NonNullable<TContext>, null>
	right: <TContext, TLeftContext = TContext>(x: TContext) => IEither<TContext, TLeftContext>
	left: <TContext, TRightContext = TContext>(x: TContext) => IEither<TRightContext, TContext>
}

export interface IEither<TRightContext, TLeftContext = TRightContext> {
	readonly isLeft: boolean
	readonly isRight: boolean
	equals: <TNewContext>(other: IEither<TRightContext | TLeftContext | TNewContext>) => boolean
	[unsafeGet]: () => TLeftContext | TRightContext
	map: <TNewContext>(
		onRight: Unary<TRightContext, TNewContext>,
	) => IEither<TNewContext, TLeftContext>
	bimap: <TOnRightContext, TOnLeftContext = TOnRightContext>(
		onLeft: Unary<TLeftContext, TOnLeftContext>,
		onRight: Unary<TRightContext, TOnRightContext>,
	) => IEither<TOnRightContext, TOnLeftContext>
	leftMap: <TNewContext>(
		onLeft: Unary<TLeftContext, TNewContext>,
	) => IEither<TRightContext, TNewContext>
	leftChain: <TNewContext>(
		onLeft: (ctx: TLeftContext) => IEither<TRightContext, TNewContext>,
	) => IEither<TRightContext, TNewContext>
	ap: <TNewContext>(
		other: IEither<
			TNewContext extends Unary<TRightContext>
				? TNewContext
				: TRightContext extends Unary<TNewContext>
				? TNewContext
				: never
		>,
	) => IEither<TNewContext, TLeftContext>
	swap: () => IEither<TLeftContext, TRightContext>
	chain: <TNewContext, TFail>(
		onRight: (ctx: TRightContext) => IEither<TNewContext, TFail>,
	) => IEither<TNewContext, TLeftContext | TFail>
	fold: <TOnRightContext, TOnLeftContext = TOnRightContext>(
		onLeft: Unary<TLeftContext, TOnLeftContext>,
		onRight: Unary<TRightContext, TOnRightContext>,
	) => TOnLeftContext | TOnRightContext
}

export const left = <TLeftContext, TRightContext = TLeftContext>(
	x: TLeftContext,
): IEither<TRightContext, TLeftContext> => ({
	isLeft: true,
	isRight: false,
	equals: (o) => o.isLeft && o[unsafeGet]() === x,
	[unsafeGet]: () => x,
	map: () => left(x),
	bimap: (onLeft) => left(onLeft(x)),
	leftMap: (f) => left(f(x)),
	leftChain: (f) => f(x),
	swap: () => right(x) as any,
	ap: () => left(x),
	chain: () => left(x),
	fold: (onLeft) => onLeft(x),
})

export const right = <TContext>(x: TContext): IEither<TContext> => ({
	isLeft: false,
	isRight: true,
	equals: (o) => o.isRight && o[unsafeGet]() === x,
	[unsafeGet]: () => x,
	map: (f) => right(f(x)) as any,
	bimap: (_, onRight) => right(onRight(x)) as any,
	leftMap: () => right(x) as any,
	leftChain: () => right(x) as any,
	swap: () => left(x),
	ap: (other) => {
		const y: any = other.fold(
			() => undefined,
			(x) => x,
		)
		const isFunctionX = isFunction(x)

		if (!isFunctionX && !isFunction(y)) {
			throw new TypeError('At least one of the Eithers must hold a function to allow io.ap.')
		}

		return isFunctionX ? other.map(x as any) : right(y(x))
	},
	chain: (f) => f(x) as any,
	fold: (_, onRight) => onRight(x),
})

export const Either: IEitherStatic = {
	try: (thunk) => {
		try {
			return right(thunk())
		} catch (error) {
			return left(error)
		}
	},
	fromNullable: (x) => (x == null ? left(null) : (right(x) as any)),
	right: (x) => right(x) as any,
	left: (x) => left(x),
}
