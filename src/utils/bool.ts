import type { Unary } from '../types/common-types'

const value = Symbol('MonoidInternalValue')

interface IBooleanMonoid {
	readonly isTrue: boolean
	readonly isFalse: boolean
	readonly isAll: boolean
	readonly isAny: boolean
	[value]: boolean
	equals: (other: IBooleanMonoid) => boolean
	concat: (other: IBooleanMonoid) => IBooleanMonoid
	ifTrue: (f: Unary<void, any>) => IBooleanMonoid
	ifFalse: (f: Unary<void, any>) => IBooleanMonoid
}

export const any = <TContext = boolean>(x: TContext): IBooleanMonoid => ({
	isTrue: Boolean(x),
	isFalse: !x,
	isAll: false,
	isAny: true,
	equals: (other) => other.isAny && Boolean(x) === other[value],
	[value]: Boolean(x),
	concat: (other) => any(x || other[value]),
	ifTrue: (f) => (x ? (f(), any(x)) : any(x)),
	ifFalse: (f) => (x ? any(x) : (f(), any(x))),
})

export const all = <TContext = boolean>(x: TContext): IBooleanMonoid => ({
	isTrue: Boolean(x),
	isFalse: !x,
	isAll: true,
	isAny: false,
	equals: (other) => other.isAll && Boolean(x) === other[value],
	[value]: Boolean(x),
	concat: (other) => all(x && other[value]),
	ifTrue: (f) => (x ? (f(), all(x)) : all(x)),
	ifFalse: (f) => (x ? all(x) : (f(), all(x))),
})
