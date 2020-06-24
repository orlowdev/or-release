import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'
import { any } from '../../utils/bool'

interface IDeps {
	logWarning: LogFunction
}

type Ctx = Pick<IAppCtx, 'public'>

export const logPublic = ({ logWarning }: IDeps) => ({ public: isPublic }: Ctx) =>
	any(isPublic).ifFalse(() => logWarning('Public API is not declared.'))
