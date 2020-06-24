import type { IAppCtx } from 'types/app-ctx'
import type { LogExitingWarning } from '../../utils/logger'
import { any } from '../../utils/bool'

interface IExitIfDryRunDeps {
	logExitingWarning: LogExitingWarning
}

type ExitIfDryRunCtx = Pick<IAppCtx, 'dryRun'>

export const exitIfDryRun = ({ logExitingWarning }: IExitIfDryRunDeps) => ({
	dryRun,
}: ExitIfDryRunCtx) =>
	any(dryRun).ifTrue(() =>
		logExitingWarning('Dry run mode. New version will not be published. Terminating.'),
	)
