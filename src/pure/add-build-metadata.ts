import { IAppCtx } from '../types/app-ctx'

type Ctx = Pick<IAppCtx, 'newVersion' | 'buildMetadata'>

export const addBuildMetadata = ({ newVersion, buildMetadata }: Ctx) => ({
	newVersion: buildMetadata ? newVersion.concat('+').concat(buildMetadata) : newVersion,
})
