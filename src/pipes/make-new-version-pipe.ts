import type { IAppCtx } from '../types/app-ctx'
import type { LogExitingWarning, LogFunction } from '../utils/logger'
import { addPreRelease } from '../pure/add-pre-release'
import { exitIfNoBumping } from '../pure/validators/exit-if-no-bumping'
import { forceBumping } from '../pure/force-bumping'
import { logNewVersion } from '../pure/loggers/log-new-version'
import { makeNewVersion } from '../pure/make-new-version'
import { ExtendPipe } from '../utils/pipe'
import { addBuildMetadata } from '../pure/add-build-metadata'
import { addPrefix } from '../pure/add-prefix'

interface IDeps {
	logSuccess: LogFunction
	logInfo: LogFunction
	logExitingWarning: LogExitingWarning
}

export const makeNewVersionPipe = ({ logSuccess, logInfo, logExitingWarning }: IDeps) =>
	ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
		.pipeExtend(forceBumping({ key: 'bumpPatch', logInfo }))
		.pipeExtend(forceBumping({ key: 'bumpMinor', logInfo }))
		.pipeExtend(forceBumping({ key: 'bumpMajor', logInfo }))
		.pipeTap(exitIfNoBumping({ logExitingWarning }))
		.pipeExtend(makeNewVersion)
		.pipeExtend(addPreRelease)
		.pipeExtend(addBuildMetadata)
		.pipeExtend(addPrefix)
		.pipeTap(logNewVersion({ logSuccess }))
