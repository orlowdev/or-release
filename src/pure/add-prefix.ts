import type { IAppCtx } from '../types/app-ctx'

type Ctx = Pick<IAppCtx, 'newVersion' | 'prefix'>

export const addPrefix = ({ newVersion, prefix }: Ctx) => ({
	newVersion: `${prefix}${newVersion}`,
})
