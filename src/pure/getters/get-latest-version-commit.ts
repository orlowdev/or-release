import type { IAppCtx } from '../../types/app-ctx'
import type { Unary } from '../../types/common-types'
import type { IEither } from '../../utils/either'
import type { LogFatalError } from '../../utils/logger'

interface IDeps {
	execEither: Unary<string, IEither<string, Error>>
	logFatalError: LogFatalError
}

type Ctx = Pick<IAppCtx, 'latestVersion'>

export const getLatestVersionCommit = ({ execEither, logFatalError }: IDeps) => ({
	latestVersion,
}: Ctx) => ({
	latestVersionCommit: execEither(getCommitCommand(latestVersion)).fold(
		logFatalError('Could not get latest version commit due to error.'),
		(latestVersionCommit) => latestVersionCommit,
	),
})

// ------------------------------------------------------------------------------------------------

const getCommitCommand = (latestVersion: string) =>
	latestVersion === '0.0.0'
		? 'git rev-list --max-parents=0 HEAD'
		: `git show-ref ${latestVersion} -s`
