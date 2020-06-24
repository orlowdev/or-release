import type { LogFatalError } from '../../utils/logger'
import type { IAppCtx } from '../../types/app-ctx'
import { Either } from '../../utils/either'

interface IExitIfInvalidBuildMetadataDeps {
	logFatalError: LogFatalError
}

type ExitIfInvalidBuildMetadataCtx = Pick<IAppCtx, 'buildMetadata'>

export const exitIfInvalidBuildMetadata = ({ logFatalError }: IExitIfInvalidBuildMetadataDeps) => ({
	buildMetadata,
}: ExitIfInvalidBuildMetadataCtx) =>
	Either.fromNullable(buildMetadata || null).chain((metadata) =>
		Either.fromNullable(/^[\da-zA-Z-]+(\.[\da-zA-Z-]+)*$/.exec(metadata))
			.leftMap(() => new Error('Build metadata syntax is invalid'))
			.leftMap(logFatalError('Could not start the application:')),
	)
