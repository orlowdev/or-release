import test from 'ava'
import {hello} from '../src'

test('template', (t) => {
	t.is(hello, 'world!')
})
