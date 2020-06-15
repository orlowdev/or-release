import test from 'ava'
import { ExtendPipe, Pipe } from '../../src/utils/pipe'

const fn1 = (x: number) => x + 1
const fn2 = (x: number) => x + 2
const fn3 = (x: number) => x + 3

test('Pipe associativity (Semigroup)', (t) => {
	t.is(
		Pipe.of(fn1).concat(Pipe.of(fn2)).concat(Pipe.of(fn3)).process(1),
		Pipe.of(fn1)
			.concat(Pipe.of(fn2).concat(Pipe.of(fn3)))
			.process(1),
	)
})

test('Pipe left identity (Monoid)', (t) => {
	t.is(Pipe.empty().concat(Pipe.of(fn1)).process(1), Pipe.of(fn1).process(1))
})

test('Pipe right identity (Monoid)', (t) => {
	t.is(Pipe.of(fn1).concat(Pipe.empty()).process(1), Pipe.of(fn1).process(1))
})

test('Pipe processes properly with one function', (t) => {
	t.is(Pipe.of(fn1).process(1), 2)
})

test('Pipe processes properly with multiple functions', (t) => {
	t.is(Pipe.from(fn1, fn2).process(3), 6)
})

test('Pipe.pipe extends the middleware chain', (t) => {
	t.is(Pipe.of(fn1).pipe(fn2).process(3), 6)
})

test('Pipe.pipeTap returns the argument instead of the computation result', (t) => {
	t.is(
		Pipe.of(fn1)
			.pipeTap(() => false)
			.process(1),
		2,
	)
})

test('concat merges two Pipes into a single Pipe', (t) => {
	t.is(Pipe.from(fn1).concat(Pipe.from(fn2)).process(3), 6)
})

test('concat with type transformations preserves the process arg type', (t) => {
	t.true(
		Pipe.of(fn1)
			.concat(Pipe.of((x: number) => x === 2))
			.process(1),
	)

	t.is(Pipe.of(fn1).concat(Pipe.of(String.fromCharCode)).process(34), '#')
})

const efn1 = () => ({ x: 1 })
const efn2 = () => ({ y: 2 })
const efn3 = () => ({ z: 3 })

test('ExtendPipe.pipeExtend extends previous context with its result', (t) => {
	t.deepEqual(ExtendPipe.of(efn1).pipeExtend(efn2).process(), { x: 1, y: 2 })
})

test('ExtendPipe associativity (Semigroup)', (t) => {
	t.deepEqual(
		ExtendPipe.of(efn1).concat(ExtendPipe.of(efn2)).concat(ExtendPipe.of(efn3)).process(),
		ExtendPipe.of(efn1)
			.concat(ExtendPipe.of(efn2).concat(ExtendPipe.of(efn3)))
			.process(),
	)
})

test('ExtendPipe left identity (Monoid)', (t) => {
	t.deepEqual(
		ExtendPipe.empty().concat(ExtendPipe.of(efn1)).process(),
		ExtendPipe.of(efn1).process(),
	)
})

test('ExtendPipe right identity (Monoid)', (t) => {
	t.deepEqual(
		ExtendPipe.of(efn1).concat(ExtendPipe.empty()).process(),
		ExtendPipe.of(efn1).process(),
	)
})

test('ExtendPipe.pipe ends the extension', (t) => {
	t.is(
		ExtendPipe.of(efn1)
			.pipe(({ x }) => x)
			.process(),
		1,
	)
})

test('ExtendPipePipe.pipeTap returns the argument instead of the computation result', (t) => {
	t.deepEqual(
		ExtendPipe.of(efn1)
			.pipeTap(() => false)
			.process(),
		{ x: 1 },
	)
})

test('concat merges two ExtendPipes into a single Pipe', (t) => {
	t.deepEqual(ExtendPipe.of(efn1).concat(ExtendPipe.of(efn2)).process(), { x: 1, y: 2 })
})

test('pipeExtend extends previous context with its result', (t) => {
	t.deepEqual(
		ExtendPipe.of(() => ({ x: 1 }))
			.pipeExtend(({ x }) => ({ y: x + 1 }))
			.process(),
		{ x: 1, y: 2 },
	)
})
