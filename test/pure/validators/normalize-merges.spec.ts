import test from 'ava'
import { normalizeMerges } from '../../../src/pure/validators/normalize-merges'

test('normalizeMerges preserves valid "merges" values', (t) => {
	t.deepEqual(normalizeMerges({ merges: 'exclude' }), { merges: 'exclude' })
	t.deepEqual(normalizeMerges({ merges: 'include' }), { merges: 'include' })
	t.deepEqual(normalizeMerges({ merges: 'only' }), { merges: 'only' })
})

test('normalizeMerges sets "merges" to "exclude" on any other value', (t) => {
	t.deepEqual(normalizeMerges({ merges: '' } as any), { merges: 'exclude' })
	t.deepEqual(normalizeMerges({ merges: '123' } as any), { merges: 'exclude' })
	t.deepEqual(normalizeMerges({ merges: true } as any), { merges: 'exclude' })
})
