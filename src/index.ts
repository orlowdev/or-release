#!/usr/bin/env node

import type { IAppCtx } from './types/app-ctx'
import { execSync } from 'child_process'
import { Either } from './utils/either'
import { execWith, trimCmdNewLine } from './utils/helpers'
import { ExtendPipe } from './utils/pipe'
import { getCurrentCommit } from './pipes/get-current-commit'
import { getLatestVersion } from './pipes/get-latest-version'
import { getLatestVersionCommit } from './pipes/get-latest-version-commit'
import { getChanges } from './pipes/get-changes'
import { blue, error, green, ILogger, info, orange, red, success, warning } from './utils/logger'
import { forceBumping } from './pipes/force-bumping'
import { makeNewVersion } from './pipes/make-new-version'
import { exitIfNoBumping } from './pipes/exit-if-no-bumping'

export const processExit = (code: number) => process.exit(code)

const execCmdSync = execWith((cmd: string) =>
	execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }),
)

const execEither = (cmd: string) => Either.try<string, Error>(execCmdSync(cmd)).map(trimCmdNewLine)

const logger: ILogger = {
	red,
	orange,
	blue,
	green,
	error,
	warning,
	info,
	success,
}

ExtendPipe.empty<IAppCtx>()
	.pipeExtend(getCurrentCommit({ execEither, processExit, logger }))
	.pipeExtend(getLatestVersion({ execEither, logger }))
	.pipeExtend(getLatestVersionCommit({ execEither, processExit, logger }))
	.pipeExtend(getChanges({ execEither, processExit, logger }))
	.pipeExtend(forceBumping({ key: 'bumpPatch', logger }))
	.pipeExtend(forceBumping({ key: 'bumpMinor', logger }))
	.pipeExtend(forceBumping({ key: 'bumpMajor', logger }))
	.pipeExtend(exitIfNoBumping({ logger, processExit }))
	.pipeExtend(makeNewVersion({ logger }))
	.process()

/*
TODO:
ForceBump
MakeNewVersion
ExitIfNoVersion(() => process.exit(0))
MakeChangelogIfRequired
Log(stdOut)
*/
