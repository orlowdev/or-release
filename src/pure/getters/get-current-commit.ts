import type { IEither } from '../../utils/either'
import type { Unary } from '../../types/common-types'

export interface IGetCurrentCommitDeps {
	execEither: Unary<string, IEither<string, Error>>
	logFatalError: Unary<string, Unary<Error, never>>
}

export const getCurrentCommit = ({ execEither, logFatalError }: IGetCurrentCommitDeps) => () => ({
	currentCommit: execEither('git rev-parse HEAD').fold(
		logFatalError('Could not get current commit due to error.'),
		(cc) => cc.slice(0, 7),
	),
})
