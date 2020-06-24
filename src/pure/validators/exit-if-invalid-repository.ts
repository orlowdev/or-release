import type { LogFatalError } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'
import { Either } from '../../utils/either'

interface IDeps {
	logFatalError: LogFatalError
}

type Ctx = Pick<IAppCtx, 'repository'>

export const exitIfInvalidRepository = ({ logFatalError }: IDeps) => ({ repository }: Ctx) =>
	Either.fromNullable(repository)
		.chain((repo) => Either.fromNullable(/^\w+\/\w+$/.exec(repo)))
		.leftMap(() => new Error('Repository undefined or syntax is invalid'))
		.leftMap(logFatalError('Could not start the application:'))
