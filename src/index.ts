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

const argv = process.argv.slice(2)

if (argv.includes('--version')) {
	const { version } = require(resolve(__dirname, 'package.json'))
	console.log(version)
	process.exit(0)
}

if (argv.includes('--help')) {
	const { version } = require(resolve(__dirname, 'package.json'))

	logInfo`
Priestine Versions ${version}

A tool for automating Semantic Versioning on your project.

Usage:

${({ g }) => g('--config-file')}=${({ y }) =>
		y('<path>')}			Relative custom path to a JSON, YAML or TOML config file
${({ g }) => g('--token')}=${({ y }) => y('<token>')}				Token for publishing release	
${({ g }) => g('--repository')}=${({ y }) => y('<owner/repo>')}		Repository URL path for publishing
${({ g }) => g('--latest-version')}=${({ y }) =>
		y('<version>')}		Custom version to start checking changes from
${({ g }) => g('--prefix')}=${({ y }) => y('<string>')}			Version prefix, e.g. "v" for "v1.0.0"
${({ g }) => g('--build-metadata')}=${({ y }) => y('<string>')}		SemVer build metadata
${({ g }) => g('--pre-release')}=${({ y }) => y('<string>')}			SemVer Pre-Release
${({ g }) => g('--custom-url')}=${({ y }) => y('<url>')}			Custom URL (for On-Premise users of GH/GL)
${({ g }) => g('--merges')}=${({ y }) =>
		y('<include|exclude|only>')}		Merge commit inclusion strategy. Default "exclude"
${({ g }) => g('--bump-patch')}[=<true|false>]		Force bumping patch version
${({ g }) => g('--bump-minor')}[=<true|false>]		Force bumping minor version
${({ g }) => g('--bump-major')}[=<true|false>]		Force bumping major version
${({ g }) => g('--public')}[=<true|false>]			Declare public API (allow bumping major versions)
${({ g }) => g('--dry-run')}[=<true|false>]		Skip publishing new release
${({ g }) => g('--debug')}[=<true|false>]			Run the app in debug mode

--version				Display current @priestine/versions version
--help					Show usage help message (this one)
`
	process.exit(0)
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
		conventions: [
			{
				match: ['^:ambulance:', '^:bug:', '^:lock:'],
				bumps: 'patch',
				groupTitleFormat: '\n\n## :bug: ∘ :ambulance: ∘ :lock: Fixes\n',
				groupDescription: '',
				itemDescriptionFormat: '- %commit.description% (%commit.abbrevHash%)',
				itemBodyFormat: '> %commit.body%',
			},
			{
				match: ['^:sparkles:'],
				bumps: 'minor',
				groupTitleFormat: '\n\n## :sparkles: Features\n',
				groupDescription: '',
				itemDescriptionFormat: '- %commit.description% (%commit.abbrevHash%)',
				itemBodyFormat: '> %commit.body%',
			},
			{
				match: ['^:boom:'],
				bumps: 'major',
				groupTitleFormat: '\n\n## :boom: Breaking Changes\n',
				groupDescription: '',
				itemDescriptionFormat: '- %commit.description% (%commit.abbrevHash%)',
				itemBodyFormat: '> %commit.body%',
			},
		],
	})
