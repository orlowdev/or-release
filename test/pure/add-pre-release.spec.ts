import test from 'ava'
import { addPreRelease } from '../../src/pure/add-pre-release'

test('addPreRelease appends pre-release to the new version', (t) => {
	t.deepEqual(addPreRelease({ newVersion: '1.0.0', preRelease: 'alpha', allTags: ['1.0.0'] }), {
		newVersion: '1.0.0-alpha.1',
	})
})

test('addPreRelease should increment the number of the pre-release if it already exists for the version', (t) => {
	t.deepEqual(
		addPreRelease({ newVersion: '1.0.0', preRelease: 'alpha', allTags: ['1.0.0-alpha.1'] }),
		{
			newVersion: '1.0.0-alpha.2',
		},
	)
})

test('addPreRelease should preserve new version if pre-release is not defined', (t) => {
	t.deepEqual(addPreRelease({ newVersion: '1.0.0', preRelease: '', allTags: [] }), {
		newVersion: '1.0.0',
	})
})
