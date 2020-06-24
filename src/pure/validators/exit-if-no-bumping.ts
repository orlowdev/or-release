import type { IAppCtx } from '../../types/app-ctx'
import type { BumpKey } from '../../types/common-types'
import type { LogExitingWarning } from '../../utils/logger'
import { any } from '../../utils/bool'

interface IDeps {
	logExitingWarning: LogExitingWarning
}

type Ctx = Pick<IAppCtx, BumpKey>

export const exitIfNoBumping = ({ logExitingWarning }: IDeps) => ({
	bumpPatch,
	bumpMinor,
	bumpMajor,
}: Ctx) =>
	any(bumpPatch)
		.concat(any(bumpMinor))
		.concat(any(bumpMajor))
		.ifFalse(() => logExitingWarning('Version bumping is not needed. Terminating.'))
