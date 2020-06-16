import type { Unary } from '../types/common-types'

const value = Symbol('MonoidInternalValue')

interface IAll {
	[value]: boolean
	concat: (other: IAll) => IAll
	ifTrue: (f: Unary<void, any>) => IAll
	ifFalse: (f: Unary<void, any>) => IAll
}

export const any = <TContext = boolean>(x: TContext): IAll => ({
	[value]: Boolean(x),
	concat: (other) => any(x || other[value]),
	ifTrue: (f) => (x ? (f(), any(x)) : any(x)),
	ifFalse: (f) => (x ? any(x) : (f(), any(x))),
})
