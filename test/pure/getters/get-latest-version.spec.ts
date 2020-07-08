import test from 'ava'
import { getLatestVersion } from '../../../src/pure/getters/get-latest-version'

const logWarning = () => undefined

test('getLatestVersion should return version 0.0.0 if there are no previous tags', (t) => {
	t.deepEqual(
		getLatestVersion({ logWarning })({ allTags: [], noTrailingZeroes: false, latestVersion: '' }),
		{ latestVersion: '0.0.0' },
	)
})

test('getLatestVersion should return latest version unchanged if it was already assigned', (t) => {
	t.deepEqual(
		getLatestVersion({ logWarning })({
			allTags: [],
			noTrailingZeroes: false,
			latestVersion: '1.0.0',
		}),
		{ latestVersion: '1.0.0' },
	)
})

test('getLatestVersion should return the latest matching version', (t) => {
	t.deepEqual(
		getLatestVersion({ logWarning })({
			allTags: ['1', 'abs', '1.0.0'],
			noTrailingZeroes: false,
			latestVersion: '',
		}),
		{ latestVersion: '1.0.0' },
	)
})

test('getLatestVersion should return the latest matching version with no trailing zeroes', (t) => {
	t.deepEqual(
		getLatestVersion({ logWarning })({
			allTags: ['1', 'abs', '1.0.0'],
			noTrailingZeroes: true,
			latestVersion: '',
		}),
		{ latestVersion: '1' },
	)
})
