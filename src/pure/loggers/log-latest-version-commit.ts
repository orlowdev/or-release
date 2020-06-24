import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'

interface IDeps {
	logInfo: LogFunction
}

type Ctx = Pick<IAppCtx, 'latestVersionCommit'>

export const logLatestVersionCommit = ({ logInfo }: IDeps) => ({ latestVersionCommit }: Ctx) =>
	logInfo`Latest version commit: ${({ g }) => g(latestVersionCommit)}`
