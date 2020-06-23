import { IAppCtx } from '../types/app-ctx'

type AddBuildMetadataCtx = Pick<IAppCtx, 'newVersion' | 'buildMetadata'>

export const addBuildMetadata = ({ newVersion, buildMetadata }: AddBuildMetadataCtx) => ({
	newVersion: buildMetadata ? newVersion.concat('+').concat(buildMetadata) : newVersion,
})
