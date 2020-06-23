import type { IAppCtx } from '../../types/app-ctx'
import type { LogFunction } from '../../utils/logger'

export const logLatestVersion = (log: LogFunction) => ({
	latestVersion,
}: Pick<IAppCtx, 'latestVersion'>) => log`Latest version: ${({ g }) => g(latestVersion)}`
