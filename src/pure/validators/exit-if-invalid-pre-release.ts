import type { IAppCtx } from '../../types/app-ctx'
import type { LogFatalError } from '../../utils/logger'
import { Either } from '../../utils/either'

interface IDeps {
	logFatalError: LogFatalError
}

type Ctx = Pick<IAppCtx, 'preRelease'>

export const exitIfInvalidPreRelease = ({ logFatalError }: IDeps) => ({ preRelease }: Ctx) =>
	Either.fromNullable(preRelease || null).chain((pr) =>
		Either.fromNullable(
			/^(0|[1-9]\d*|\d*[a-zA-Z-][\da-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][\da-zA-Z-]*))*$/.exec(pr),
		)
			.leftMap(() => new Error('Pre-Release syntax is invalid'))
			.leftMap(logFatalError('Could not start the application:')),
	)
