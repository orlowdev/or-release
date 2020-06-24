import type { IAppCtx } from '../../types/app-ctx'
import type { LogFunction } from '../../utils/logger'

interface IDeps {
	logInfo: LogFunction
}

type Ctx = Pick<IAppCtx, 'currentCommit'>

export const logCurrentCommit = ({ logInfo }: IDeps) => ({ currentCommit }: Ctx) =>
	logInfo`Current commit: ${({ g }) => g(currentCommit.slice(0, 7))}`
