#!/usr/bin/env node

import type { IAppCtx } from './types/app-ctx'
import type { Conventions } from './types/common-types'
import httpTransport from 'got'
import { makeNewVersionPipe } from './pipes/make-new-version-pipe'
import { getConfigurationPipe } from './pipes/get-configuration-pipe'
import { getGitDataPipe } from './pipes/get-git-data-pipe'
import { validateInputPipe } from './pipes/validate-input-pipe'
import { exitIfDryRun } from './pure/validators/exit-if-dry-run'
import { makeChangelog } from './pure/make-changelog'
import { publishTag } from './pure/publish-tag'
import { logExitingWarning, logFatalError, logInfo, logSuccess, logWarning } from './utils/logger'
import { ExtendPipe } from './utils/pipe'

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
	.concat(makeNewVersionPipe({ logInfo, logSuccess, conventions, logExitingWarning }))
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
