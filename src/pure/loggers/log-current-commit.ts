import type { IAppCtx } from '../../types/app-ctx'
import type { LogFunction } from '../../utils/logger'

export const logCurrentCommit = (log: LogFunction) => ({
	currentCommit,
}: Pick<IAppCtx, 'currentCommit'>) => log`Current commit: ${({ g }) => g(currentCommit)}`
