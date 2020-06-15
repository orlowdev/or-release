import type { ILogger } from '../utils/logger'
import type { IEither } from '../utils/either'
import type { Unary } from '../types/common-types'
import { errorToString, tap } from '../utils/helpers'

export interface IGetCurrentCommitDeps {
	execEither: Unary<string, IEither<string, Error>>
	processExit: Unary<number, never>
	logger: ILogger
}

export const getCurrentCommit = ({
	execEither,
	processExit,
	logger,
}: IGetCurrentCommitDeps) => () => ({
	currentCommit: execEither('git rev-parse HEAD')
		.bimap(
			tap(() => logger.error('Could not get current commit hash due to error:')),
			(cc) => cc.slice(0, 7),
		)
		.leftMap((error: Error) => logger.error(errorToString(error)))
		.fold(
			() => processExit(1),
			tap((currentCommit: string) =>
				logger.info(`Current commit hash: ${logger.green(currentCommit)}`),
			),
		),
})
