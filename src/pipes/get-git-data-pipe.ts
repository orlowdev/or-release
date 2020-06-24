import type { IAppCtx } from '../types/app-ctx'
import type { LogFatalError, LogFunction } from '../utils/logger'
import { execSync } from 'child_process'
import { ExtendPipe } from '../utils/pipe'
import { getCurrentCommit } from '../pure/getters/get-current-commit'
import { logCurrentCommit } from '../pure/loggers/log-current-commit'
import { logPrefix } from '../pure/loggers/log-prefix'
import { getAllTags } from '../pure/getters/get-all-tags'
import { getLatestVersion } from '../pure/getters/get-latest-version'
import { logLatestVersion } from '../pure/loggers/log-latest-version'
import { validatePublic } from '../pure/normalizers/normalize-public'
import { logPublic } from '../pure/loggers/log-public'
import { validateMergeStrategy } from '../pure/normalizers/normalize-merges'
import { logMerges } from '../pure/loggers/log-merges'
import { getLatestVersionCommit } from '../pure/getters/get-latest-version-commit'
import { logLatestVersionCommit } from '../pure/loggers/log-latest-version-commit'
import { getChanges } from '../pure/getters/get-changes'
import { logChanges } from '../pure/loggers/log-changes'
import { execWith, trimCmdNewLine } from '../utils/helpers'
import { Either } from '../utils/either'

interface IGetGitDataPipeDeps {
	logFatalError: LogFatalError
	logInfo: LogFunction
	logWarning: LogFunction
}

export const getGitDataPipe = ({ logFatalError, logInfo, logWarning }: IGetGitDataPipeDeps) =>
	ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
		.pipeExtend(getCurrentCommit({ execEither, logFatalError }))
		.pipeTap(logCurrentCommit(logInfo))
		.pipeTap(logPrefix(logInfo))
		.pipeExtend(getAllTags({ execEither }))
		.pipeExtend(getLatestVersion({ logWarning }))
		.pipeTap(logLatestVersion(logInfo))
		.pipeExtend(validatePublic)
		.pipeTap(logPublic(logWarning))
		.pipeExtend(validateMergeStrategy)
		.pipeTap(logMerges(logInfo))
		.pipeExtend(getLatestVersionCommit({ execEither, logFatalError }))
		.pipeTap(logLatestVersionCommit(logInfo))
		.pipeExtend(getChanges({ execEither, logFatalError }))
		.pipeTap(logChanges(logInfo))

// ------------------------------------------------------------------------------------------------

const execCmdSync = execWith((cmd: string) =>
	execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }),
)

const execEither = (cmd: string) => Either.try<string, Error>(execCmdSync(cmd)).map(trimCmdNewLine)
