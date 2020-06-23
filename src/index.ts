#!/usr/bin/env node

import { execSync } from 'child_process'
import httpTransport from 'got'
import { getConfigurationPipe } from './pipes/get-configuration-pipe'
import { exitIfDryRun } from './pure/exits/exit-if-dry-run'
import { exitIfNoBumping } from './pure/exits/exit-if-no-bumping'
import { forceBumping } from './pure/force-bumping'
import { getAllTags } from './pure/getters/get-all-tags'
import { getChanges } from './pure/getters/get-changes'
import { getCurrentCommit } from './pure/getters/get-current-commit'
import { getLatestVersion } from './pure/getters/get-latest-version'
import { getLatestVersionCommit } from './pure/getters/get-latest-version-commit'
import { makeChangelog } from './pure/make-changelog'
import { makeNewVersion } from './pure/make-new-version'
import { publishTag } from './pure/publish-tag'
import { validateMergeStrategy } from './pure/validators/validate-merges'
import { validatePublic } from './pure/validators/validate-public'
import type { IAppCtx } from './types/app-ctx'
import { Conventions } from './types/common-types'
import { any } from './utils/bool'
import { Either } from './utils/either'
import { execWith, trimCmdNewLine } from './utils/helpers'
import { logExitingWarning, logFatalError, logInfo, logSuccess, logWarning } from './utils/logger'
import { ExtendPipe } from './utils/pipe'
import { Switch } from './utils/switch'
import { validateInputPipe } from './pipes/validate-input-pipe'

const execCmdSync = execWith((cmd: string) =>
	execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }),
)

const execEither = (cmd: string) => Either.try<string, Error>(execCmdSync(cmd)).map(trimCmdNewLine)

const conventions: Conventions = {
	bumpPatch: [':ambulance:', ':bug:', ':lock:'],
	bumpMinor: [':sparkles:'],
	bumpMajor: [':boom:'],
}

const argv = process.argv.slice(2)

const env: Record<string, string> = Object.keys(process.env)
	.filter((key) => key.startsWith('PRIESTINE_VERSIONS_'))
	.reduce(
		(acc, key) => ({
			...acc,
			[key]: env[key],
		}),
		{},
	)

ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
	.concat(getConfigurationPipe({ argv, env }))
	.concat(validateInputPipe({ logFatalError }))
	.pipeExtend(getCurrentCommit({ execEither, logFatalError }))
	.pipeTap(({ currentCommit }) => logInfo`Current commit: ${({ g }) => g(currentCommit)}`)
	.pipeTap(({ prefix }) =>
		any(prefix).ifTrue(() => logInfo`New version will be prefixed with "${({ g }) => g(prefix)}"`),
	)
	.pipeExtend(getAllTags({ execEither }))
	.pipeExtend(getLatestVersion({ logWarning }))
	.pipeTap(({ latestVersion }) => logInfo`Latest version: ${({ g }) => g(latestVersion)}`)
	.pipeExtend(validatePublic)
	.pipeTap(({ public: isPublic }) =>
		any(isPublic)
			.ifTrue(() => logInfo`Public API is declared.`)
			.ifFalse(() => logWarning`Public API is not declared.`),
	)
	.pipeExtend(validateMergeStrategy)
	.pipeTap(({ merges }) =>
		Switch.of(merges)
			.case(
				'exclude',
				() => logInfo`Merge commits are ${({ r }) => r('excluded')} from commit evaluation list.`,
			)
			.case(
				'only',
				() =>
					logInfo`${({ b }) => b('Only')} merge commits are ${({ b }) =>
						b('included')} in commit evaluation list.`,
			)
			.default(
				() => logInfo`Merge commits are ${({ g }) => g('included')} in commit evaluation list.`,
			)(),
	)
	.pipeExtend(getLatestVersionCommit({ execEither, logFatalError }))
	.pipeTap(
		({ latestVersionCommit }) => logInfo`Latest version commit: ${({ g }) => g(latestVersionCommit)}`,
	)
	.pipeExtend(getChanges({ execEither, logFatalError }))
	.pipeTap(
		({ commitList }) =>
			logInfo`Changes found since previous version: ${({ g }) => g(commitList.length)}`,
	)
	.pipeExtend(forceBumping({ key: 'bumpPatch', logInfo, conventions }))
	.pipeExtend(forceBumping({ key: 'bumpMinor', logInfo, conventions }))
	.pipeExtend(forceBumping({ key: 'bumpMajor', logInfo, conventions }))
	.pipeTap(exitIfNoBumping({ logExitingWarning }))
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
	.pipeExtend(({ newVersion, prefix }) => ({
		newVersion: `${prefix}${newVersion}`,
	}))
	.pipeTap(({ newVersion }) => logSuccess`Version candidate: ${({ g }) => g(newVersion)}`)
	.pipeExtend(makeChangelog({ conventions }))
	.pipeTap(exitIfDryRun({ logExitingWarning }))
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
