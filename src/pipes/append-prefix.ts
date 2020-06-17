import type { IAppCtx } from 'types/app-ctx'

type AppendPrefixCtx = Pick<IAppCtx, 'latestVersion' | 'prefix'>

export const appendPrefix = ({ latestVersion, prefix }: AppendPrefixCtx) => ({
	latestVersion: prefix && latestVersion ? prefix.concat(latestVersion) : latestVersion,
})
