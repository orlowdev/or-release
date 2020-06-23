import type { Unary } from '../types/common-types'

const value = Symbol('MonoidInternalValue')

interface IBooleanMonoid {
	[value]: boolean
	concat: (other: IBooleanMonoid) => IBooleanMonoid
	ifTrue: (f: Unary<void, any>) => IBooleanMonoid
	ifFalse: (f: Unary<void, any>) => IBooleanMonoid
}

export const any = <TContext = boolean>(x: TContext): IBooleanMonoid => ({
	[value]: Boolean(x),
	concat: (other) => any(x || other[value]),
	ifTrue: (f) => (x ? (f(), any(x)) : any(x)),
	ifFalse: (f) => (x ? any(x) : (f(), any(x))),
})

export const all = <TContext = boolean>(x: TContext): IBooleanMonoid => ({
	[value]: Boolean(x),
	concat: (other) => all(x && other[value]),
	ifTrue: (f) => (x ? (f(), all(x)) : all(x)),
	ifFalse: (f) => (x ? all(x) : (f(), all(x))),
})
