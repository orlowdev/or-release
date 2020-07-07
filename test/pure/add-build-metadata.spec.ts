import test from 'ava'
import { addBuildMetadata } from '../../src/pure/add-build-metadata'

test('addBuildMetadata appends build metadata to the new version', (t) => {
	t.deepEqual(addBuildMetadata({ newVersion: '1.0.0', buildMetadata: '20200101' }), {
		newVersion: '1.0.0+20200101',
	})
})

test('addBuildMetadata preserves the new version if build metadata is not defined', (t) => {
	t.deepEqual(addBuildMetadata({ newVersion: '1.0.0', buildMetadata: '' }), { newVersion: '1.0.0' })
})
