import type { IAppCtx } from '../types/app-ctx'
import type { Conventions } from '../types/common-types'
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
	conventions: Conventions
	logExitingWarning: LogExitingWarning
}

export const makeNewVersionPipe = ({
	logSuccess,
	logInfo,
	conventions,
	logExitingWarning,
}: IDeps) =>
	ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
		.pipeExtend(forceBumping({ key: 'bumpPatch', logInfo, conventions }))
		.pipeExtend(forceBumping({ key: 'bumpMinor', logInfo, conventions }))
		.pipeExtend(forceBumping({ key: 'bumpMajor', logInfo, conventions }))
		.pipeTap(exitIfNoBumping({ logExitingWarning }))
		.pipeExtend(makeNewVersion)
		.pipeExtend(addPreRelease)
		.pipeExtend(addBuildMetadata)
		.pipeExtend(addPrefix)
		.pipeTap(logNewVersion({ logSuccess }))
