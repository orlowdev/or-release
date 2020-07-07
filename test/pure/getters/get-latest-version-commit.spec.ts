import test from 'ava'
import * as sinon from 'sinon'
import { getLatestVersionCommit } from '../../../src/pure/getters/get-latest-version-commit'
import { Either } from '../../../src/utils/either'

const spy: any = sinon.spy()

test('getLatestVersionCommit fails with fatal error if it could not extract latest version tag commit', (t) => {
	t.deepEqual(
		getLatestVersionCommit({
			execEither: (x) => Either.left(new Error(x)),
			logFatalError: () => spy,
		})({
			latestVersion: '1.0.0',
		}),
		{ latestVersionCommit: undefined as any },
	)

	t.true(spy.calledOnce)
})

test('getLatestVersionCommit extracts commit of the latest version tag with execEither', (t) => {
	t.deepEqual(
		getLatestVersionCommit({
			execEither: (cmd: string) => Either.right(cmd),
			logFatalError: () => spy,
		})({
			latestVersion: '1.0.0',
		}),
		{ latestVersionCommit: 'git show-ref 1.0.0 -s' },
	)
})

test('getLatestVersionCommit extracts initial commit with execEither if there are no previous tags', (t) => {
	t.deepEqual(
		getLatestVersionCommit({
			execEither: (cmd: string) => Either.right(cmd),
			logFatalError: () => spy,
		})({
			latestVersion: '0.0.0',
		}),
		{ latestVersionCommit: 'git rev-list --max-parents=0 HEAD' },
	)
})
