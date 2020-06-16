#!/usr/bin/env node

import type { IAppCtx } from './types/app-ctx'
import type { Unary } from './types/common-types'
import { execSync } from 'child_process'
import httpTransport from 'got'
import { red, yellow, blue, green } from 'chalk'
import {
	ILogger,
	IColorizer,
	errorPrefix,
	warningPrefix,
	infoPrefix,
	successPrefix,
} from './utils/logger'
import { Either } from './utils/either'
import { execWith, trimCmdNewLine } from './utils/helpers'
import { ExtendPipe } from './utils/pipe'
import { getCurrentCommit } from './pipes/get-current-commit'
import { getLatestVersion } from './pipes/get-latest-version'
import { getLatestVersionCommit } from './pipes/get-latest-version-commit'
import { getChanges } from './pipes/get-changes'
import { forceBumping } from './pipes/force-bumping'
import { makeNewVersion } from './pipes/make-new-version'
import { exitIfNoBumping } from './pipes/exit-if-no-bumping'
import { makeChangelog } from './pipes/make-changelog'
import { Conventions } from './types/common-types'
import { getConfigFromArgv } from './pipes/get-config'
import { publishTag } from './pipes/publish-tag'

const argv = process.argv

const processExit = (code: number) => process.exit(code)

const execCmdSync = execWith((cmd: string) =>
	execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }),
)

const log = <T>(applyColor: Unary<T, string>) => (message: T): void =>
	console.log(applyColor(message))

const error = log(errorPrefix)
const warning = log(warningPrefix)
const info = log(infoPrefix)
const success = log(successPrefix)

const execEither = (cmd: string) => Either.try<string, Error>(execCmdSync(cmd)).map(trimCmdNewLine)

const logger: ILogger = {
	error,
	warning,
	info,
	success,
}

const colors: IColorizer = {
	red,
	yellow,
	blue,
	green,
}

const conventions: Conventions = {
	bumpPatch: [':ambulance:', ':bug:', ':lock:'],
	bumpMinor: [':sparkles:'],
	bumpMajor: [':boom:'],
}

ExtendPipe.empty<IAppCtx>()
	.pipeExtend(getConfigFromArgv({ argv }))
	.pipeExtend(getCurrentCommit({ execEither, processExit, logger, colors }))
	.pipeExtend(getLatestVersion({ execEither, logger, colors }))
	.pipeExtend(getLatestVersionCommit({ execEither, processExit, logger, colors }))
	.pipeExtend(getChanges({ execEither, processExit, logger, colors }))
	.pipeExtend(forceBumping({ key: 'bumpPatch', logger, conventions, colors }))
	.pipeExtend(forceBumping({ key: 'bumpMinor', logger, conventions, colors }))
	.pipeExtend(forceBumping({ key: 'bumpMajor', logger, conventions, colors }))
	.pipeExtend(exitIfNoBumping({ logger, processExit }))
	.pipeExtend(makeNewVersion({ logger, colors }))
	.pipeExtend(makeChangelog({ conventions }))
	.pipe(publishTag({ processExit, logger, httpTransport, colors }))
	.process({ token: '', bumpPatch: false, bumpMinor: false, bumpMajor: false, repository: '' })
