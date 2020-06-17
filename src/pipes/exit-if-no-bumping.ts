import type { ILogger } from '../utils/logger'
import type { Unary, BumpKey } from '../types/common-types'
import type { IAppCtx } from '../types/app-ctx'
import { any } from '../utils/any'
import { tap } from '../utils/helpers'

interface IExitIfNoBumpingDeps {
	logger: ILogger
	processExit: Unary<number, never>
}

type ExitIfNoBumpingCtx = Pick<IAppCtx, BumpKey>

export const exitIfNoBumping = ({ logger, processExit }: IExitIfNoBumpingDeps) => ({
	bumpPatch,
	bumpMinor,
	bumpMajor,
}: ExitIfNoBumpingCtx) =>
	any(bumpPatch)
		.concat(any(bumpMinor))
		.concat(any(bumpMajor))
		.ifFalse(tap(() => logger.warning('Version bumping is not needed. Terminating.')))
		.ifFalse(() => processExit(0))
