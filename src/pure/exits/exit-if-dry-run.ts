import type { IAppCtx } from 'types/app-ctx'
import type { Unary } from 'types/common-types'
import { any } from '../../utils/bool'

interface IExitIfDryRunDeps {
	logExitingWarning: Unary<string, never>
}

type ExitIfDryRunCtx = Pick<IAppCtx, 'dryRun'>

export const exitIfDryRun = ({ logExitingWarning }: IExitIfDryRunDeps) => ({
	dryRun,
}: ExitIfDryRunCtx) =>
	any(dryRun).ifTrue(() =>
		logExitingWarning('Dry run mode. New version will not be published. Terminating.'),
	)
