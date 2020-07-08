#!/usr/bin/env node

import type { IAppCtx } from './types/app-ctx'
import httpTransport from 'got'
import { readFileSync } from 'fs'
import { execSync } from 'child_process'
import { resolve } from 'path'
import { makeNewVersionPipe } from './pipes/make-new-version-pipe'
import { getConfigurationPipe } from './pipes/get-configuration-pipe'
import { getGitDataPipe } from './pipes/get-git-data-pipe'
import { validateInputPipe } from './pipes/validate-input-pipe'
import { exitIfDryRun } from './pure/validators/exit-if-dry-run'
import { makeChangelog } from './pure/make-changelog'
import { publishTag } from './pure/publish-tag'
import { logExitingWarning, logFatalError, logInfo, logSuccess, logWarning } from './utils/logger'
import { ExtendPipe } from './utils/pipe'
import { Either } from './utils/either'
import { execWith, trimCmdNewLine } from './utils/helpers'
import { logChangelog } from './pure/loggers/log-changelog'
import { showHelpMessage } from './utils/helper-options'

const argv = process.argv.slice(2)

if (argv.includes('--version')) {
	const { version } = require(resolve(__dirname, 'package.json'))
	logInfo(version)
	process.exit(0)
}

if (argv.includes('--help')) {
	const { version } = require(resolve(__dirname, 'package.json'))
	showHelpMessage(version, logInfo)
}

const readFileEither = (path: string) => Either.try<string, Error>(() => readFileSync(path, 'utf8'))

const execCmdSync = execWith((cmd: string) =>
	execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }),
)

const execEither = (cmd: string) => Either.try<string, Error>(execCmdSync(cmd)).map(trimCmdNewLine)

const env: Record<string, string> = Object.keys(process.env)
	.filter((key) => key.startsWith('PRIESTINE_VERSIONS_'))
	.reduce(
		(acc, key) => ({
			...acc,
			[key]: process.env[key],
		}),
		{},
	)

ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
	.concat(getConfigurationPipe({ argv, env, readFileEither }))
	.concat(validateInputPipe({ logFatalError }))
	.concat(getGitDataPipe({ logFatalError, logInfo, logWarning, execEither }))
	.concat(makeNewVersionPipe({ logInfo, logSuccess, logExitingWarning }))
	.pipeExtend(makeChangelog)
	.pipeTap(logChangelog({ logInfo }))
	.pipeTap(exitIfDryRun({ logExitingWarning }))
	.pipe(publishTag({ logFatalError, logInfo, logSuccess, httpTransport }))
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
		showChangelog: false,
		merges: 'exclude',
		configFile: '',
		buildMetadata: '',
		preRelease: '',
		transport: 'github',
		customUrl: '',
		prefixReset: false,
		noTrailingZeroes: false,
		conventions: [
			{
				match: ['^:ambulance:', '^:bug:', '^:lock:'],
				bumps: 'patch',
				groupTitleFormat: '\n\n## :bug: ∘ :ambulance: ∘ :lock: Fixes\n',
				groupDescription: '',
				itemDescriptionFormat: '- %commit.description% (%commit.abbrevHash%)',
				itemBodyFormat: '> %commit.body%\n',
			},
			{
				match: ['^:sparkles:'],
				bumps: 'minor',
				groupTitleFormat: '\n\n## :sparkles: Features\n',
				groupDescription: '',
				itemDescriptionFormat: '- %commit.description% (%commit.abbrevHash%)',
				itemBodyFormat: '> %commit.body%\n',
			},
			{
				match: ['^:boom:'],
				bumps: 'major',
				groupTitleFormat: '\n\n## :boom: Breaking Changes\n',
				groupDescription: '',
				itemDescriptionFormat: '- %commit.description% (%commit.abbrevHash%)',
				itemBodyFormat: '> %commit.body%\n',
			},
		],
	})
	.catch(console.error)
