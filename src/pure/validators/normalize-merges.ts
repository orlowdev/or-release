import type { IAppCtx } from '../../types/app-ctx'
import { Switch } from '../../utils/switch'

type Ctx = Pick<IAppCtx, 'merges'>

export const normalizeMerges = ({ merges }: Ctx) => ({
	merges: Switch.of(merges).case('include', 'include').case('only', 'only').default('exclude'),
})
