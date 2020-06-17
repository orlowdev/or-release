#!/usr/bin/env node

import type { IAppCtx } from './types/app-ctx'
import type { Unary } from './types/common-types'
import { execSync } from 'child_process'
import httpTransport from 'got'
import { transformCase } from '@priestine/case-transformer'
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
import { mergeConfig } from './pipes/merge-config'
import { publishTag } from './pipes/publish-tag'
import { appendPrefix } from './pipes/append-prefix'
import { any } from './utils/any'
import { setPublicOption } from './pipes/set-public-option'

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

const argvToObject = (argv: string[]): IAppCtx =>
	argv.reduce<any>((acc, arg) => {
		if (!arg.startsWith('--')) {
			return acc
		}

		let [key, value] = arg.includes('=') ? arg.split('=') : [arg]
		const validKey = transformCase(key.slice(2)).from.kebab.to.camel.toString()

		if (!value) {
			value = 'true'
		}

		acc[validKey] = value

		return acc
	}, {})

const envToObject = (env: NodeJS.ProcessEnv) =>
	Object.keys(env)
		.filter((key) => key.startsWith('PRIESTINE_VERSIONS_'))
		.reduce(
			(acc, key) => ({
				...acc,
				[transformCase(key.slice(19)).from.upperSnake.to.camel.toString()]: env[key],
			}),
			{},
		)

ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
	.pipeExtend(mergeConfig(envToObject(process.env)))
	.pipeExtend(mergeConfig(argvToObject(process.argv.slice(2))))
	.pipeExtend(getCurrentCommit({ execEither, processExit, logger, colors }))
	.pipeExtend(appendPrefix)
	.pipeTap(({ prefix }) =>
		any(prefix).ifTrue(() =>
			logger.info(`New version will be prefixed with "${colors.green(prefix)}"`),
		),
	)
	.pipeExtend(getLatestVersion({ execEither, logger, colors }))
	.pipeExtend(setPublicOption)
	.pipeTap(({ public: isPublic }) =>
		any(isPublic)
			.ifTrue(() => logger.success('Public API is declared.'))
			.ifFalse(() =>
				logger.warning(
					'Public API is not declared. MAJOR changes will bump MINOR version to stay within 0.x.x.',
				),
			),
	)
	.pipeExtend(getLatestVersionCommit({ execEither, processExit, logger, colors }))
	.pipeExtend(getChanges({ execEither, processExit, logger, colors }))
	.pipeExtend(forceBumping({ key: 'bumpPatch', logger, conventions, colors }))
	.pipeExtend(forceBumping({ key: 'bumpMinor', logger, conventions, colors }))
	.pipeExtend(forceBumping({ key: 'bumpMajor', logger, conventions, colors }))
	.pipeTap(exitIfNoBumping({ logger, processExit }))
	.pipeExtend(makeNewVersion({ logger, colors }))
	.pipeExtend(makeChangelog({ conventions }))
	.pipe(publishTag({ processExit, logger, httpTransport, colors }))
	.process({
		token: '',
		bumpPatch: false,
		bumpMinor: false,
		bumpMajor: false,
		repository: '',
		latestVersion: '',
		prefix: '',
		public: false,
		dryRun: false,
	})
