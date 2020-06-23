import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'

export const logNewVersion = (log: LogFunction) => ({ newVersion }: Pick<IAppCtx, 'newVersion'>) =>
	log`Version candidate: ${({ g }) => g(newVersion)}`
