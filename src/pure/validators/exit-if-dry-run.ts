import type { IAppCtx } from 'types/app-ctx'
import type { LogExitingWarning } from '../../utils/logger'
import { any } from '../../utils/bool'

interface IDeps {
	logExitingWarning: LogExitingWarning
}

type Ctx = Pick<IAppCtx, 'dryRun'>

export const exitIfDryRun = ({ logExitingWarning }: IDeps) => ({ dryRun }: Ctx) =>
	any(dryRun).ifTrue(() =>
		logExitingWarning('Dry run mode. New version will not be published. Terminating.'),
	)
