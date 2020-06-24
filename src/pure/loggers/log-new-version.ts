import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'

interface IDeps {
	logSuccess: LogFunction
}

type Ctx = Pick<IAppCtx, 'newVersion'>

export const logNewVersion = ({ logSuccess }: IDeps) => ({ newVersion }: Ctx) =>
	logSuccess`Version candidate: ${({ g }) => g(newVersion)}`
