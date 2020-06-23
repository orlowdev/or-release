import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'

export const logChanges = (log: LogFunction) => ({ commitList }: Pick<IAppCtx, 'commitList'>) =>
	log`Changes found since previous version: ${({ g }) => g(commitList.length)}`
