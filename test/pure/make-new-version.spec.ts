import test from 'ava'
import { makeNewVersion } from '../../src/pure/make-new-version'

test('makeNewVersion bumps only major version if major bump is required', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '1.0.0',
			public: true,
			prefixReset: false,
			prefix: '',
			bumpPatch: true,
			bumpMinor: true,
			bumpMajor: true,
		}),
		{ newVersion: '2.0.0' },
	)
})

test('makeNewVersion bumps only minor version if minor bump is required', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '1.0.0',
			public: true,
			prefixReset: false,
			prefix: '',
			bumpPatch: true,
			bumpMinor: true,
			bumpMajor: false,
		}),
		{ newVersion: '1.1.0' },
	)
})

test('makeNewVersion bumps only patch version if patch bump is required', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '1.0.0',
			public: true,
			prefixReset: false,
			prefix: '',
			bumpPatch: true,
			bumpMinor: false,
			bumpMajor: false,
		}),
		{ newVersion: '1.0.1' },
	)
})

test('makeNewVersion produces new version equal to the latest version if bumping is not needed', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '1.0.0',
			public: true,
			prefixReset: false,
			prefix: '',
			bumpPatch: false,
			bumpMinor: false,
			bumpMajor: false,
		}),
		{ newVersion: '1.0.0' },
	)
})

test('makeNewVersion properly bumps versions without trailing zeroes', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '1',
			public: true,
			prefixReset: false,
			prefix: '',
			bumpPatch: true,
			bumpMinor: false,
			bumpMajor: false,
		}),
		{ newVersion: '1.0.1' },
	)
})

test('makeNewVersion stays within 0 major version if public API is not declared', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '0',
			public: false,
			prefixReset: false,
			prefix: '',
			bumpPatch: true,
			bumpMinor: true,
			bumpMajor: true,
		}),
		{ newVersion: '0.1.0' },
	)
})

test('makeNewVersion resets major version to 1 if prefixReset is true and prefix changed', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '2019.3.2.1',
			public: true,
			prefixReset: true,
			prefix: '2020',
			bumpPatch: true,
			bumpMinor: false,
			bumpMajor: false,
		}),
		{ newVersion: '1.0.0' },
	)
})

test('makeNewVersion continues incrementing the version if prefixReset is true but the prefix did not change', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '2019.3.2.1',
			public: true,
			prefixReset: true,
			prefix: '2019',
			bumpPatch: true,
			bumpMinor: false,
			bumpMajor: false,
		}),
		{ newVersion: '3.2.2' },
	)
})

test('makeNewVersion returns 0.1.0 if latest version is not defined and public API is not declared', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '',
			public: false,
			prefixReset: false,
			prefix: '',
			bumpPatch: false,
			bumpMinor: false,
			bumpMajor: false,
		}),
		{ newVersion: '0.1.0' },
	)
})

test('makeNewVersion returns 1.0.0 if latest version is not defined and public API is declared', (t) => {
	t.deepEqual(
		makeNewVersion({
			latestVersion: '',
			public: true,
			prefixReset: false,
			prefix: '',
			bumpPatch: false,
			bumpMinor: false,
			bumpMajor: false,
		}),
		{ newVersion: '1.0.0' },
	)
})
