import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'
import { any } from '../../utils/bool'

interface IDeps {
	logInfo: LogFunction
}

type Ctx = Pick<IAppCtx, 'prefix'>

export const logPrefix = ({ logInfo }: IDeps) => ({ prefix }: Ctx) =>
	any(prefix).ifTrue(() => logInfo`New version will be prefixed with "${({ g }) => g(prefix)}"`)
