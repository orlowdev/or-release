import test from 'ava'
import { errorToString, execWith, extendWith, tap, trimCmdNewLine } from '../../src/utils/helpers'
import sinon from 'sinon'

test('uses provided function to extend provided object', (t) => {
	const object_ = { x: 1, y: 2 }

	const extend = extendWith(({ x, y }: typeof object_) => ({
		z: x + y,
		y: 5,
	}))

	t.deepEqual(extend(object_), { x: 1, y: 5, z: 3 })
})

const spy = sinon.spy()

test('calls provided function with provided argument and returns the argument back', (t) => {
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
