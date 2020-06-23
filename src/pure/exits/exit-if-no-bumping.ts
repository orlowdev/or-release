import type { IAppCtx } from '../../types/app-ctx'
import type { BumpKey, Unary } from '../../types/common-types'
import { any } from '../../utils/bool'

interface IExitIfNoBumpingDeps {
	logExitingWarning: Unary<string, never>
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
