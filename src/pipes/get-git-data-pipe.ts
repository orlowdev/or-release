import type { IAppCtx } from '../types/app-ctx'
import type { Unary } from '../types/common-types'
import type { IEither } from '../utils/either'
import type { LogFatalError, LogFunction } from '../utils/logger'
import { getAllTags } from '../pure/getters/get-all-tags'
import { getChanges } from '../pure/getters/get-changes'
import { getCurrentCommit } from '../pure/getters/get-current-commit'
import { getLatestVersion } from '../pure/getters/get-latest-version'
import { getLatestVersionCommit } from '../pure/getters/get-latest-version-commit'
import { logChanges } from '../pure/loggers/log-changes'
import { logCurrentCommit } from '../pure/loggers/log-current-commit'
import { logLatestVersion } from '../pure/loggers/log-latest-version'
import { logLatestVersionCommit } from '../pure/loggers/log-latest-version-commit'
import { logMerges } from '../pure/loggers/log-merges'
import { logPrefix } from '../pure/loggers/log-prefix'
import { logPublic } from '../pure/loggers/log-public'
import { validateMergeStrategy } from '../pure/validators/normalize-merges'
import { validatePublic } from '../pure/validators/normalize-public'
import { ExtendPipe } from '../utils/pipe'

interface IDeps {
	logFatalError: LogFatalError
	logInfo: LogFunction
	logWarning: LogFunction
	execEither: Unary<string, IEither<string, Error>>
}

export const getGitDataPipe = ({ logFatalError, logInfo, logWarning, execEither }: IDeps) =>
	ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
		.pipeExtend(getCurrentCommit({ execEither, logFatalError }))
		.pipeTap(logCurrentCommit({ logInfo }))
		.pipeTap(logPrefix({ logInfo }))
		.pipeExtend(getAllTags({ execEither }))
		.pipeExtend(getLatestVersion({ logWarning }))
		.pipeTap(logLatestVersion({ logInfo }))
		.pipeExtend(validatePublic)
		.pipeTap(logPublic({ logWarning }))
		.pipeExtend(validateMergeStrategy)
		.pipeTap(logMerges({ logInfo }))
		.pipeExtend(getLatestVersionCommit({ execEither, logFatalError }))
		.pipeTap(logLatestVersionCommit({ logInfo }))
		.pipeExtend(getChanges({ execEither, logFatalError }))
		.pipeTap(logChanges({ logInfo }))
