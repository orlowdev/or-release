import type { ILogFunction, Unary } from 'types/common-types'
import type { IAppCtx } from 'types/app-ctx'
import { any } from '../utils/any'

interface IExitIfDryRunDeps {
	logWarning: ILogFunction
	processExit: Unary<number, never>
}

type ExitIfDryRunCtx = Pick<IAppCtx, 'dryRun'>

export const exitIfDryRun = ({ logWarning, processExit }: IExitIfDryRunDeps) => ({
	dryRun,
}: ExitIfDryRunCtx) =>
	any(dryRun)
		.ifTrue(() => logWarning`Dry run mode. New version will not be published. Terminating.`)
		.ifTrue(() => processExit(1))
