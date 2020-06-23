import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'
import { any } from '../../utils/bool'

export const logPublic = (log: LogFunction) => ({ public: isPublic }: Pick<IAppCtx, 'public'>) =>
	any(isPublic).ifFalse(() => log('Public API is not declared.'))
