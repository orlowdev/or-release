import test from 'ava'
import { Either } from '../../src/utils/either'

test('Either.fromNullable is a Left for null', (t) => {
	t.false(
		Either.fromNullable(null).fold(
			() => false,
			() => true,
		),
	)
})

test('Either.fromNullable is a Left for undefined', (t) => {
	t.false(
		Either.fromNullable(undefined).fold(
			() => false,
			() => true,
		),
	)
})

test('Either.fromNullable is a Right for values that are != null', (t) => {
	t.true(
		Either.fromNullable(0).fold(
			() => false,
			() => true,
		),
	)
})

test('Either.try captures an error in a Left', (t) => {
	const err = new Error('Test')
	t.true(
		Either.try(() => {
			throw err
		}).equals(Either.left(err)),
	)
})

test('Either.try captures result in a right', (t) => {
	t.true(Either.try(() => 1).equals(Either.of(1)))
})

test('left.equals is true for another left of the same value', (t) => {
	t.true(Either.left(1).equals(Either.left(1)))
})

test('right.equals is true for another right of the same value', (t) => {
	t.true(Either.right(1).equals(Either.of(1)))
})

test('left.swap returns a right of the same value', (t) => {
	t.true(Either.left(1).swap().equals(Either.of(1)))
})

test('right.swap returns a left of the same value', (t) => {
	t.true(Either.right(1).swap().equals(Either.left(1)))
})

test('right.ap applies the function in the right in the argument', (t) => {
	t.true(
		Either.right(1)
			.ap(Either.right((x) => x + 1))
			.equals(Either.of(2)),
	)
})

test('right.ap ignores the function in the left in the argument', (t) => {
	t.true(
		Either.right(1)
			.ap(Either.left((x) => x + 1))
			.equals(Either.of(1)),
	)
})

test('left.ap returns a left of the same value', (t) => {
	t.true(
		Either.left(1)
			.ap(Either.right((x) => x + 1))
			.equals(Either.left(1)),
	)
})

test('left.chain returns a left of the same value', (t) => {
	const f = (x: number) => Either.of(x + 1)
	const g = (x: number) => Either.of(x + 2)

	t.true(Either.left(1).chain(f).chain(g).equals(Either.left(1)))
})

test('Functor - Identity', (t) => {
	t.true(
		Either.right(1)
			.map((x) => x)
			.equals(Either.of(1)),
	)

	t.true(
		Either.left(1)
			.map((x) => x)
			.equals(Either.left(1)),
	)

	t.true(
		Either.right(1)
			.leftMap((x) => x)
			.equals(Either.of(1)),
	)

	t.true(
		Either.left(1)
			.leftMap((x) => x)
			.equals(Either.left(1)),
	)
})

test('Functor - Composition', (t) => {
	const f = (x: number) => x + 1
	const g = (x: number) => x + 2

	t.true(
		Either.right(1)
			.map((x) => f(g(x)))
			.equals(Either.of(1).map(g).map(f)),
	)

	t.true(Either.left(1).map(g).map(f).equals(Either.left(1)))

	t.true(
		Either.right(1)
			.leftMap((x) => f(g(x)))
			.equals(Either.of(1).leftMap(g).leftMap(f)),
	)

	t.true(
		Either.left(1)
			.leftMap((x) => f(g(x)))
			.equals(Either.left(1).leftMap(g).leftMap(f)),
	)
})

test('Bifunctor - Identity', (t) => {
	t.true(
		Either.right(1)
			.bimap(
				(x) => x,
				(y) => y,
			)
			.equals(Either.of(1)),
	)

	t.true(
		Either.left(1)
			.bimap(
				(x) => x,
				(y) => y,
			)
			.equals(Either.left(1)),
	)
})

test('Bifunctor - Composition', (t) => {
	const f = (x: number) => x + 1
	const g = (x: number) => x + 2
	const h = f
	const i = g

	t.true(
		Either.right(1)
			.bimap(
				(x) => f(g(x)),
				(x) => h(i(x)),
			)
			.equals(Either.of(1).bimap(g, i).bimap(f, h)),
	)

	t.true(
		Either.left(1)
			.bimap(
				(x) => f(g(x)),
				(x) => h(i(x)),
			)
			.equals(Either.left(1).bimap(g, i).bimap(f, h)),
	)
})

test('Applicative - Identity', (t) => {
	t.true(
		Either.right(1)
			.ap(Either.of((x) => x))
			.equals(Either.of(1)),
	)
})

test('Applicative - Homomorphism', (t) => {
	const f = (x: number) => x + 1
	// A.of(x).ap(A.of(f)) is equivalent to A.of(f(x))
	t.true(
		Either.of(1)
			.ap(Either.of(f))
			.equals(Either.of(f(1))),
	)
})

test('Applicative - Interchange', (t) => {
	const y = 1
	const f = (x: number) => x + 1
	const u = Either.of(f)

	t.true(
		Either.of(y)
			.ap(u)
			.equals(u.ap(Either.of((f) => f(y)))),
	)
})

test('Chain - Associativity', (t) => {
	const f = (x: number) => Either.of(x + 1)
	const g = (x: number) => Either.of(x + 2)

	t.true(
		Either.of(1)
			.chain(f)
			.chain(g)
			.equals(Either.of(1).chain((x) => f(x).chain(g))),
	)
})

test('Chain - Associativity for leftChain', (t) => {
	const f = (x: number) => Either.of(x + 1)
	const g = (x: number) => Either.of(x + 2)

	t.true(
		Either.left(1)
			.leftChain(f)
			.leftChain(g)
			.equals(Either.left(1).leftChain((x) => f(x).leftChain(g))),
	)
})
