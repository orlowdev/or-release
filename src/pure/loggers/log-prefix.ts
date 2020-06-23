import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'
import { any } from '../../utils/bool'

export const logPrefix = (log: LogFunction) => ({ prefix }: Pick<IAppCtx, 'prefix'>) =>
	any(prefix).ifTrue(() => log`New version will be prefixed with "${({ g }) => g(prefix)}"`)
