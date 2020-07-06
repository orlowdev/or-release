import test from 'ava'
import { Switch } from '../../src/utils/switch'

test('Switch returns default if none of the cases matched', (t) => {
	t.true(Switch.of(1).case(2, false).default(true))
	t.true(
		Switch.of(1)
			.case((x) => x > 1, false)
			.default(true),
	)
})

test('Switch returns value assigned to the matched case', (t) => {
	t.true(Switch.of(1).case(1, true).default(false))
	t.true(
		Switch.of(1)
			.case((x) => x == 1, true)
			.case((x) => x < 1, false)
			.default(false),
	)
})
