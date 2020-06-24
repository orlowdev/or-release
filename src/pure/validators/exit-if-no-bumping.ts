import type { IAppCtx } from '../../types/app-ctx'
import type { BumpKey } from '../../types/common-types'
import type { LogExitingWarning } from '../../utils/logger'
import { any } from '../../utils/bool'

interface IExitIfNoBumpingDeps {
	logExitingWarning: LogExitingWarning
}

type ExitIfNoBumpingCtx = Pick<IAppCtx, BumpKey>

export const exitIfNoBumping = ({ logExitingWarning }: IExitIfNoBumpingDeps) => ({
	bumpPatch,
	bumpMinor,
	bumpMajor,
}: ExitIfNoBumpingCtx) =>
	any(bumpPatch)
		.concat(any(bumpMinor))
		.concat(any(bumpMajor))
		.ifFalse(() => logExitingWarning('Version bumping is not needed. Terminating.'))
