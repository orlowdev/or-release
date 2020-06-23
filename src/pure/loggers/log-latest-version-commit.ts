import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'

export const logLatestVersionCommit = (log: LogFunction) => ({
	latestVersionCommit,
}: Pick<IAppCtx, 'latestVersionCommit'>) =>
	log`Latest version commit: ${({ g }) => g(latestVersionCommit)}`
