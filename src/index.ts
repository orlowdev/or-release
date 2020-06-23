#!/usr/bin/env node

import type { IAppCtx } from './types/app-ctx'
import type { Conventions } from './types/common-types'
import httpTransport from 'got'
import { getConfigurationPipe } from './pipes/get-configuration-pipe'
import { validateInputPipe } from './pipes/validate-input-pipe'
import { exitIfDryRun } from './pure/exits/exit-if-dry-run'
import { exitIfNoBumping } from './pure/exits/exit-if-no-bumping'
import { forceBumping } from './pure/force-bumping'
import { makeChangelog } from './pure/make-changelog'
import { makeNewVersion } from './pure/make-new-version'
import { publishTag } from './pure/publish-tag'
import { Either } from './utils/either'
import { logExitingWarning, logFatalError, logInfo, logSuccess, logWarning } from './utils/logger'
import { ExtendPipe } from './utils/pipe'
import { getGitDataPipe } from './pipes/get-git-data-pipe'

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
	.concat(getGitDataPipe({ logFatalError, logInfo, logWarning }))
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
