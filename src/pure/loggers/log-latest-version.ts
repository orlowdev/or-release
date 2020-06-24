import type { IAppCtx } from '../../types/app-ctx'
import type { LogFunction } from '../../utils/logger'

interface IDeps {
	logInfo: LogFunction
}

type Ctx = Pick<IAppCtx, 'latestVersion'>

export const logLatestVersion = ({ logInfo }: IDeps) => ({ latestVersion }: Ctx) =>
	logInfo`Latest version: ${({ g }) => g(latestVersion)}`
