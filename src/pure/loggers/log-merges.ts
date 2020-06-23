import type { IAppCtx } from '../../types/app-ctx'
import type { LogFunction } from '../../utils/logger'
import { Switch } from '../../utils/switch'

export const logMerges = (logInfo: LogFunction) => ({ merges }: Pick<IAppCtx, 'merges'>) =>
	Switch.of(merges)
		.case(
			'exclude',
			() => logInfo`Merge commits are ${({ r }) => r('excluded')} from commit evaluation list.`,
		)
		.case(
			'only',
			() =>
				logInfo`${({ b }) => b('Only')} merge commits are ${({ b }) =>
					b('included')} in commit evaluation list.`,
		)
		.default(
			() => logInfo`Merge commits are ${({ g }) => g('included')} in commit evaluation list.`,
		)()
