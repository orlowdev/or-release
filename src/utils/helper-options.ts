import { LogFunction } from './logger'

export const showHelpMessage = (version: string, logInfo: LogFunction) => {
	logInfo`
||release ${version}

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
${({ g }) => g('--prefix-reset')}[=<true|false>]		Reset major version on prefix change
${({ g }) => g('--dry-run')}[=<true|false>]		Skip publishing new release
${({ g }) => g('--debug')}[=<true|false>]			Run the app in debug mode


--version				Display current or-release version
--help					Show usage help message (this one)
`
	process.exit(0)
}
