import type { IEither } from '../utils/either'
import type { IAppCtx } from '../types/app-ctx'
import type { Unary, ILogger, IColorizer } from '../types/common-types'
import { errorToString, tap } from '../utils/helpers'

const getCommitCommand = (latestVersion: string, prefix: string) =>
	latestVersion === `${prefix}0.0.0`
		? 'git rev-list --max-parents=0 HEAD'
		: `git show-ref ${latestVersion} -s`

interface IGetLatestVersionCommitDeps {
	execEither: Unary<string, IEither<string, Error>>
	processExit: Unary<number, never>
	logger: ILogger
	colors: IColorizer
}

type IGetLatestVersionCommitCtx = Pick<IAppCtx, 'latestVersion' | 'prefix'>

export const getLatestVersionCommit = ({
	execEither,
	processExit,
	logger,
	colors,
}: IGetLatestVersionCommitDeps) => ({ latestVersion, prefix }: IGetLatestVersionCommitCtx) => ({
	latestVersionCommit: execEither(getCommitCommand(latestVersion, prefix))
		.leftMap(tap(() => logger.error('Could not get latest version commit due to error:')))
		.leftMap((error: Error) => logger.error(errorToString(error)))
		.fold(
			() => processExit(1),
			tap((latestVersionCommit: string) =>
				logger.info(`Latest version commit hash: ${colors.green(latestVersionCommit.slice(0, 7))}`),
			),
		),
})
