import type { IAppCtx } from '../types/app-ctx'

type AddPrefixCtx = Pick<IAppCtx, 'newVersion' | 'prefix'>

export const addPrefix = ({ newVersion, prefix }: AddPrefixCtx) => ({
	newVersion: `${prefix}${newVersion}`,
})
