import test from 'ava'
import { removeTrailingZeroes } from '../../src/pure/remove-trailing-zeroes'

test('removeTrailingZeroes should remove last trailing zero if noTrailingZeroes option is true', (t) => {
	t.deepEqual(removeTrailingZeroes({ newVersion: '1.2.0', noTrailingZeroes: true }), {
		newVersion: '1.2',
	})
})

test('removeTrailingZeroes should not remove last trailing zero if noTrailingZeroes option is false', (t) => {
	t.deepEqual(removeTrailingZeroes({ newVersion: '1.2.0', noTrailingZeroes: false }), {
		newVersion: '1.2.0',
	})
})

test('removeTrailingZeroes should preserve latest version if it does not end with 0', (t) => {
	t.deepEqual(removeTrailingZeroes({ newVersion: '1.2.1', noTrailingZeroes: true }), {
		newVersion: '1.2.1',
	})

	t.deepEqual(removeTrailingZeroes({ newVersion: '1.2.1', noTrailingZeroes: false }), {
		newVersion: '1.2.1',
	})
})
