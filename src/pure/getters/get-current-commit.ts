import type { IEither } from '../../utils/either'
import type { Unary } from '../../types/common-types'
import type { LogFatalError } from '../../utils/logger'

export interface IGetCurrentCommitDeps {
	execEither: Unary<string, IEither<string, Error>>
	logFatalError: LogFatalError
}

export const getCurrentCommit = ({ execEither, logFatalError }: IGetCurrentCommitDeps) => () => ({
	currentCommit: execEither('git rev-parse HEAD').fold(
		logFatalError('Could not get current commit due to error.'),
		(cc) => cc.slice(0, 7),
	),
})
