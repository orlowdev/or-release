import type { IAppCtx } from '../types/app-ctx'
import { Switch } from '../utils/switch'

type SetMergeStrategyCtx = Pick<IAppCtx, 'merges'>

export const setMergeStrategy = ({ merges }: SetMergeStrategyCtx) => ({
	merges: Switch.of(merges).case('include', 'include').case('only', 'only').default('exclude'),
})
