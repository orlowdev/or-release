import type { IAppCtx } from '../../types/app-ctx'
import { Switch } from '../../utils/switch'

type ValidateMergeStrategyCtx = Pick<IAppCtx, 'merges'>

export const validateMergeStrategy = ({ merges }: ValidateMergeStrategyCtx) => ({
	merges: Switch.of(merges).case('include', 'include').case('only', 'only').default('exclude'),
})
