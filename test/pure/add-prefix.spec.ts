import test from 'ava'
import { addPrefix } from '../../src/pure/add-prefix'

test('addPrefix should prepend prefix to the version', (t) => {
	t.deepEqual(addPrefix({ newVersion: '1.0.0', prefix: 'v' }), { newVersion: 'v1.0.0' })
})
