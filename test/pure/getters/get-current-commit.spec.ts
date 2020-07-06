import test from 'ava'
import { getCurrentCommit } from '../../../src/pure/getters/get-current-commit'
import { Either } from '../../../src/utils/either'

const logFatalError: any = (message: string) => (x: Error) => message.concat('\n').concat(x.message)

test('getCurrentCommit panics and exists if the execEither fails', (t) => {
	const execEither: any = (x: string) => Either.left(new Error(x))
	t.deepEqual(getCurrentCommit({ execEither, logFatalError })(), {
		currentCommit: 'Could not get current commit due to error.\ngit rev-parse HEAD',
	})
})

test('getCurrentCommit extracts current commit with "git rev-parse HEAD"', (t) => {
	const execEither: any = (_: string) => Either.right('some commit')
	t.deepEqual(getCurrentCommit({ execEither, logFatalError })(), { currentCommit: 'some commit' })
})
