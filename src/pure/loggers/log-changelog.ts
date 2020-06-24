import type { LogFunction } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'
import { any } from '../../utils/bool'

interface IDeps {
	logInfo: LogFunction
}

type Ctx = Pick<IAppCtx, 'showChangelog' | 'changelog'>

export const logChangelog = ({ logInfo }: IDeps) => ({ showChangelog, changelog }: Ctx) =>
	any(showChangelog).ifTrue(
		() =>
			logInfo`\n${({ b }) => b('===changelog===')}\n\n${changelog}${({ b }) =>
				b('===end changelog===')}\n`,
	)
