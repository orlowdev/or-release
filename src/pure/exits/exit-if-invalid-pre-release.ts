import { Unary } from '../../types/common-types'
import { IAppCtx } from '../../types/app-ctx'
import { Either } from '../../utils/either'

interface IExitIfInvalidPreReleaseDeps {
	logFatalError: Unary<string, Unary<Error, never>>
}

type ExitIfInvalidPreReleaseCtx = Pick<IAppCtx, 'preRelease'>

export const exitIfInvalidPreRelease = ({ logFatalError }: IExitIfInvalidPreReleaseDeps) => ({
	preRelease,
}: ExitIfInvalidPreReleaseCtx) =>
	Either.fromNullable(preRelease || null).chain((pr) =>
		Either.fromNullable(
			/^(0|[1-9]\d*|\d*[a-zA-Z-][\da-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][\da-zA-Z-]*))*$/.exec(pr),
		)
			.leftMap(() => new Error('Pre-Release syntax is invalid'))
			.leftMap(logFatalError('Could not start the application:')),
	)
