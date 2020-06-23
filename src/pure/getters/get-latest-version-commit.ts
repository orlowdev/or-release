import type { IAppCtx } from '../../types/app-ctx'
import type { Unary } from '../../types/common-types'
import type { IEither } from '../../utils/either'

const getCommitCommand = (latestVersion: string) =>
	latestVersion === '0.0.0'
		? 'git rev-list --max-parents=0 HEAD'
		: `git show-ref ${latestVersion} -s`

interface IGetLatestVersionCommitDeps {
	execEither: Unary<string, IEither<string, Error>>
	logFatalError: Unary<string, Unary<Error, never>>
}

type IGetLatestVersionCommitCtx = Pick<IAppCtx, 'latestVersion'>

export const getLatestVersionCommit = ({
	execEither,
	logFatalError,
}: IGetLatestVersionCommitDeps) => ({ latestVersion }: IGetLatestVersionCommitCtx) => ({
	latestVersionCommit: execEither(getCommitCommand(latestVersion)).fold(
		logFatalError('Could not get latest version commit due to error.'),
		(latestVersionCommit) => latestVersionCommit,
	),
})
