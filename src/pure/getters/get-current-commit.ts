import type { IEither } from '../../utils/either'
import type { Unary } from '../../types/common-types'
import type { LogFatalError } from '../../utils/logger'

export interface IDeps {
	execEither: Unary<string, IEither<string, Error>>
	logFatalError: LogFatalError
}

export const getCurrentCommit = ({ execEither, logFatalError }: IDeps) => () => ({
	currentCommit: execEither('git rev-parse HEAD').fold(
		logFatalError('Could not get current commit due to error.'),
		(cc) => cc,
	),
})
