#!/usr/bin/env node

import type { IAppCtx } from './types/app-ctx'
import type { Unary, ILogger, IColorizer, ILogFunction } from './types/common-types'
import { execSync } from 'child_process'
import httpTransport from 'got'
import { transformCase } from '@priestine/case-transformer'
import { red, yellow, blue, green } from 'chalk'
import { Either } from './utils/either'
import { execWith, trimCmdNewLine, errorToString } from './utils/helpers'
import { ExtendPipe } from './utils/pipe'
import { any } from './utils/any'
import { isFunction } from './utils/guards'
import { Switch } from './utils/switch'
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
import { setPublicOption } from './pipes/set-public-option'
import { exitIfDryRun } from './pipes/exit-if-dry-run'

const processExit = (code: number) => process.exit(code)

const execCmdSync = execWith((cmd: string) =>
	execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }),
)

const execEither = (cmd: string) => Either.try<string, Error>(execCmdSync(cmd)).map(trimCmdNewLine)

const colors: IColorizer = {
	red,
	yellow,
	blue,
	green,
}

export const errorPrefix = <T>(message: T) => `💣 ${String(message)}`
export const warningPrefix = <T>(message: T) => `🤔 ${String(message)}`
export const infoPrefix = <T>(message: T) => `   ${String(message)}`
export const successPrefix = <T>(message: T) => `🎉 ${String(message)}`

const log = <T>(applyColor: Unary<T, string>) => (message: T): void =>
	console.log(applyColor(message))

const error = log(errorPrefix)
const warning = log(warningPrefix)
const info = log(infoPrefix)
const success = log(successPrefix)

const logger: ILogger = {
	error,
	warning,
	info,
	success,
}

const logWithLevel = (level: keyof ILogger): ILogFunction => (
	strings: TemplateStringsArray,
	...values: Array<Unary<IColorizer, string> | any>
) =>
	logger[level](
		strings.reduce(
			(acc, string, i) =>
				acc.concat(string).concat(
					Either.fromNullable(values[i])
						.map((value) =>
							Switch.of(value)
								.case(isFunction, () => value(colors))
								.default(() => value),
						)
						.map((f) => f())
						.fold(
							() => '',
							(x) => x,
						),
				),
			'',
		),
	)

const logInfo = logWithLevel('info')
const logError = logWithLevel('error')
const logWarning = logWithLevel('warning')
const logSuccess = logWithLevel('success')

const logFatalError = (message: string) => (error: Error) => {
	logError`${message}`
	logError`${errorToString(error)}`
	return process.exit(1)
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
	.pipeExtend(getCurrentCommit({ execEither, logFatalError }))
	.pipeTap(({ currentCommit }) => logInfo`Current commit: ${({ green }) => green(currentCommit)}`)
	.pipeExtend(appendPrefix)
	.pipeTap(({ prefix }) =>
		any(prefix).ifTrue(
			() => logInfo`New version will be prefixed with "${({ green }) => green(prefix)}"`,
		),
	)
	.pipeExtend(getLatestVersion({ execEither, logWarning }))
	.pipeTap(({ latestVersion }) => logInfo`Latest version: ${({ green }) => green(latestVersion)}`)
	.pipeExtend(setPublicOption)
	.pipeTap(({ public: isPublic }) =>
		any(isPublic)
			.ifTrue(() => logSuccess`Public API is declared.`)
			.ifFalse(() => logWarning`Public API is not declared.`),
	)
	.pipeExtend(getLatestVersionCommit({ execEither, logFatalError }))
	.pipeTap(
		({ latestVersionCommit }) =>
			logInfo`Latest version commit: ${({ green }) => green(latestVersionCommit)}`,
	)
	.pipeExtend(getChanges({ execEither, logFatalError }))
	.pipeTap(
		({ commitList }) =>
			logInfo`Changes found since previous version: ${({ green }) =>
				green(String(commitList.length))}`,
	)
	.pipeExtend(forceBumping({ key: 'bumpPatch', logInfo, conventions }))
	.pipeExtend(forceBumping({ key: 'bumpMinor', logInfo, conventions }))
	.pipeExtend(forceBumping({ key: 'bumpMajor', logInfo, conventions }))
	.pipeTap(exitIfNoBumping({ logWarning, processExit }))
	.pipeExtend(makeNewVersion)
	.pipeTap(({ newVersion }) => logSuccess`Version candidate: ${({ green }) => green(newVersion)}`)
	.pipeExtend(makeChangelog({ conventions }))
	.pipeTap(exitIfDryRun({ logWarning, processExit }))
	.pipe(publishTag({ logFatalError, logSuccess, httpTransport }))
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
