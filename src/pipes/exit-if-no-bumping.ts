import type { Unary, BumpKey, ILogFunction } from '../types/common-types'
import type { IAppCtx } from '../types/app-ctx'
import { any } from '../utils/bool'
import { tap } from '../utils/helpers'

interface IExitIfNoBumpingDeps {
	logWarning: ILogFunction
	processExit: Unary<number, never>
}

type ExitIfNoBumpingCtx = Pick<IAppCtx, BumpKey>

export const exitIfNoBumping = ({ logWarning, processExit }: IExitIfNoBumpingDeps) => ({
	bumpPatch,
	bumpMinor,
	bumpMajor,
}: ExitIfNoBumpingCtx) =>
	any(bumpPatch)
		.concat(any(bumpMinor))
		.concat(any(bumpMajor))
		.ifFalse(tap(() => logWarning`Version bumping is not needed. Terminating.`))
		.ifFalse(() => processExit(0))
