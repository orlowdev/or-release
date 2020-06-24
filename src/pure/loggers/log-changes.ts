import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'

interface IDeps {
	logInfo: LogFunction
}

type Ctx = Pick<IAppCtx, 'commitList'>

export const logChanges = ({ logInfo }: IDeps) => ({ commitList }: Ctx) =>
	logInfo`Changes found since previous version: ${({ g }) => g(commitList.length)}`
