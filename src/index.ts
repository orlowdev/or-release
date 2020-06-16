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
import { makeChangelog } from './pipes/make-changelog'
import { Conventions } from './types/common-types'
import { getConfigFromArgv } from './pipes/get-config'

const argv = process.argv

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

const conventions: Conventions = {
	bumpPatch: [':ambulance:', ':bug:', ':lock:'],
	bumpMinor: [':sparkles:'],
	bumpMajor: [':boom:'],
}

ExtendPipe.empty<IAppCtx>()
	.pipeExtend(getConfigFromArgv({ argv }))
	.pipeExtend(getCurrentCommit({ execEither, processExit, logger }))
	.pipeExtend(getLatestVersion({ execEither, logger }))
	.pipeExtend(getLatestVersionCommit({ execEither, processExit, logger }))
	.pipeExtend(getChanges({ execEither, processExit, logger }))
	.pipeExtend(forceBumping({ key: 'bumpPatch', logger, conventions }))
	.pipeExtend(forceBumping({ key: 'bumpMinor', logger, conventions }))
	.pipeExtend(forceBumping({ key: 'bumpMajor', logger, conventions }))
	.pipeExtend(exitIfNoBumping({ logger, processExit }))
	.pipeExtend(makeNewVersion({ logger }))
	.pipeExtend(makeChangelog({ conventions }))
	.pipe(console.log)
	.process({ privateToken: '' })
