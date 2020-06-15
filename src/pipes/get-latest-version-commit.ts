import type { IEither } from '../utils/either'
import type { IAppCtx } from '../types/app-ctx'
import type { Unary } from '../types/common-types'
import type { ILogger } from '../utils/logger'
import { errorToString, tap } from '../utils/helpers'

const getCommitCommand = (latestVersion: string) =>
	latestVersion === '0.0.0'
		? 'git rev-list --max-parents=0 HEAD'
		: `git show-ref ${latestVersion} -s`

interface IGetLatestVersionCommitDeps {
	execEither: Unary<string, IEither<string, Error>>
	processExit: Unary<number, never>
	logger: ILogger
}

type IGetLatestVersionCommitCtx = Pick<IAppCtx, 'latestVersion'>

export const getLatestVersionCommit = ({
	execEither,
	processExit,
	logger,
}: IGetLatestVersionCommitDeps) => ({ latestVersion }: IGetLatestVersionCommitCtx) => ({
	latestVersionCommit: execEither(getCommitCommand(latestVersion))
		.leftMap(tap(() => logger.error('Could not get latest version commit due to error:')))
		.leftMap((error: Error) => logger.error(errorToString(error)))
		.fold(
			() => processExit(1),
			tap((latestVersionCommit: string) =>
				logger.info(`Latest version commit hash: ${logger.green(latestVersionCommit.slice(0, 7))}`),
			),
		),
})
