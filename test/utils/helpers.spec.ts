import test from 'ava'
import {
	errorToString,
	execWith,
	extendWith,
	tap,
	trimCmdNewLine,
	extractVersionTuple,
} from '../../src/utils/helpers'
import * as sinon from 'sinon'

test('extendWith uses provided function to extend provided object', (t) => {
	const object_ = { x: 1, y: 2 }

	const extend = extendWith(({ x, y }: typeof object_) => ({
		z: x + y,
		y: 5,
	}))

	t.deepEqual(extend(object_), { x: 1, y: 5, z: 3 })
})

test('extendWith does not fail if provided function returns void', (t) => {
	const object_ = { x: 1, y: 2 }
	const extend = extendWith(() => undefined)

	t.deepEqual(extend(object_), object_)
})

const spy = sinon.spy()

test('tap calls provided function with provided argument and returns the argument back', (t) => {
	const tapTest = tap(spy)
	const result = tapTest(1)
	t.true(spy.called)
	t.is(result, 1)
})

test('execWith should return an IO', (t) => {
	t.is(execWith((x) => x)('')(), '')
})

test('execWith should execute provided function', (t) => {
	t.is(execWith(() => 'hello')('world')(), 'hello')
})

test('errorToString should properly transform error to a console-ready string', (t) => {
	t.is(errorToString(new Error('Something    went   wrong')), '  → Something went wrong')
})

test('trimCmdNewLine should remove ending \\n', (t) => {
	t.notRegex(trimCmdNewLine('test\n'), /\n$/)
})

test('extractVersionTuple should take version tuple from a version string', (t) => {
	const tuple: any = extractVersionTuple('1.0.0')
	t.is(tuple[0], '1.0.0')
	t.is(tuple[1], '1')
	t.is(tuple[2], '0')
	t.is(tuple[3], '0')
})
