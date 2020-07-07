import test from 'ava'
import { normalizePublic } from '../../../src/pure/validators/normalize-public'

test('normalizePublic preserves provided "public" value', (t) => {
	t.deepEqual(normalizePublic({ latestVersion: '0.0.0', public: false, prefixReset: false }), {
		public: false,
	})
})

test('normalizePublic sets "public" to "prefixReset" if there is no previous version', (t) => {
	t.deepEqual(normalizePublic({ latestVersion: '', public: false, prefixReset: true }), {
		public: true,
	})
})
test('normalizePublic sets "public" to "prefixReset" even if previous version is 0', (t) => {
	t.deepEqual(normalizePublic({ latestVersion: '0.0.0', public: true, prefixReset: false }), {
		public: true,
	})
})

test('normalizePublic forces "public" to be true if the latest major version is >=1', (t) => {
	t.deepEqual(normalizePublic({ latestVersion: '1.0.0', public: false, prefixReset: false }), {
		public: true,
	})
})
