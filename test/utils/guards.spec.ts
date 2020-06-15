import test from 'ava'
import { isFunction } from '../../src/utils/guards'

test('isFunction', (t) => {
	t.true(isFunction(() => ({})))
	t.false(isFunction({}))
})
