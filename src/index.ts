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
import { any } from './utils/bool'
import { isFunction } from './utils/guards'
import { Switch } from './utils/switch'
import { getCurrentCommit } from './pure/get-current-commit'
import { getLatestVersion } from './pure/get-latest-version'
import { getLatestVersionCommit } from './pure/get-latest-version-commit'
import { getChanges } from './pure/get-changes'
import { forceBumping } from './pure/force-bumping'
import { makeNewVersion } from './pure/make-new-version'
import { exitIfNoBumping } from './pure/exit-if-no-bumping'
import { makeChangelog } from './pure/make-changelog'
import { Conventions } from './types/common-types'
import { mergeConfig } from './pure/merge-config'
import { publishTag } from './pure/publish-tag'
import { setPublicOption } from './pure/set-public-option'
import { exitIfDryRun } from './pure/exit-if-dry-run'
import { setMergeStrategy } from './pure/set-merge-strategy'
import { getConfigFromFile } from './pure/get-config-from-file'
import { readFileSync } from 'fs'
import { getAllTags } from './pure/get-all-tags'

const processExit = (code: number) => process.exit(code)

const execCmdSync = execWith((cmd: string) =>
	execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }),
)

const execEither = (cmd: string) => Either.try<string, Error>(execCmdSync(cmd)).map(trimCmdNewLine)
const readFileEither = (path: string) => Either.try<string, Error>(() => readFileSync(path, 'utf8'))

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

export const validateBuildMetadata = ({ buildMetadata }: any) =>
	Either.fromNullable(buildMetadata || null).chain((metadata) =>
		Either.fromNullable(/^[\da-zA-Z-]+(\.[\da-zA-Z-]+)*$/.exec(metadata))
			.leftMap(() => new Error('Build metadata syntax is invalid'))
			.leftMap(logFatalError('Could not start the application:') as any),
	)

ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
	.pipeExtend(mergeConfig(envToObject(process.env)))
	.pipeExtend(mergeConfig(argvToObject(process.argv.slice(2))))
	.pipeExtend(getConfigFromFile({ readFileEither }))
	.pipeExtend(mergeConfig(envToObject(process.env)))
	.pipeExtend(mergeConfig(argvToObject(process.argv.slice(2))))
	.pipeTap(validateBuildMetadata)
	.pipeExtend(getCurrentCommit({ execEither, logFatalError }))
	.pipeTap(({ currentCommit }) => logInfo`Current commit: ${({ green }) => green(currentCommit)}`)
	.pipeTap(({ prefix }) =>
		any(prefix).ifTrue(
			() => logInfo`New version will be prefixed with "${({ green }) => green(prefix)}"`,
		),
	)
	.pipeExtend(getAllTags({ execEither }))
	.pipeExtend(getLatestVersion({ logWarning }))
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
	.pipeExtend(setMergeStrategy)
	.pipeTap(({ merges }) =>
		Switch.of(merges)
			.case(
				'exclude',
				() =>
					logInfo`Merge commits are ${({ green }) => green('excluded')} from commit evaluation list.`,
			)
			.case(
				'only',
				() =>
					logInfo`${({ green }) => green('Only')} merge commits are ${({ green }) =>
						green('included')} in commit evaluation list.`,
			)
			.default(
				() => logInfo`Merge commits are ${({ green }) => green('included')} in commit evaluation list.`,
			)(),
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
	.pipeExtend(({ newVersion, preRelease, allTags }) => ({
		newVersion: preRelease
			? Either.fromNullable(
					allTags.find((tag) => new RegExp(`${newVersion}-${preRelease}\\.\\d+`).test(tag)),
			  )
					.chain((tag) => Either.fromNullable(tag?.split('.').slice(-1)[0]))
					.map(Number)
					.fold(
						() => `${newVersion}-${preRelease}.1`,
						(latestPreRelease) => `${newVersion}-${preRelease}.${latestPreRelease + 1}`,
					)
			: newVersion,
	}))
	.pipeExtend(({ newVersion, buildMetadata }) => ({
		newVersion: buildMetadata ? newVersion.concat('+').concat(buildMetadata) : newVersion,
	}))
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
		merges: 'exclude',
		configFile: '',
		buildMetadata: '',
		preRelease: '',
	})
