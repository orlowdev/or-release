import test from 'ava'
import { isFunction, isInteger, isFloat, isBoolean } from '../../src/utils/guards'

test('isFunction', (t) => {
	t.true(isFunction(() => ({})))
	t.false(isFunction({}))
})

test('isInteger', (t) => {
	t.true(isInteger(1))
	t.false(isInteger({}))
})

test('isFloat', (t) => {
	t.true(isFloat(1.01))
	t.false(isFloat({}))
})

test('isBoolean', (t) => {
	t.true(isBoolean(true))
	t.false(isBoolean({}))
})
