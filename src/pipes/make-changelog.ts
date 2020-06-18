import type { IRawCommit } from '../types/raw-commit'
import type { IAppCtx } from '../types/app-ctx'

interface IMakeChangelogDeps {
	conventions: any
}

type MakeChangelogCtx = Pick<IAppCtx, 'newVersion' | 'commitList'>

export const makeChangelog = ({ conventions }: IMakeChangelogDeps) => ({
	newVersion,
	commitList,
}: MakeChangelogCtx) => ({
	changelog: changelogTag`
		## ${newVersion}
		
		### :boom: Breaking changes
		${commitList.filter((commit) => conventions.bumpMajor.includes(commit.type)).map(prettifyCommit)}
		
		### :sparkles: Features
		${commitList.filter((commit) => conventions.bumpMinor.includes(commit.type)).map(prettifyCommit)}
		
		### :bug: - :ambulance: - :lock: Fixes
		${commitList.filter((commit) => conventions.bumpPatch.includes(commit.type)).map(prettifyCommit)}
	`,
})

const changelogTag = (
	_: TemplateStringsArray,
	version: string,
	breakingChanges: string[],
	features: string[],
	fixes: string[],
) =>
	`# ${version}`
		.concat(breakingChanges.length > 0 ? '\n\n## :boom: Breaking Changes\n\n' : '')
		.concat(breakingChanges.join('\n'))
		.concat(features.length > 0 ? '\n\n## :sparkles: Features\n\n' : '')
		.concat(features.join('\n'))
		.concat(fixes.length > 0 ? '\n\n## :bug: ∘ :ambulance: ∘ :lock: Fixes\n\n' : '')
		.concat(fixes.join('\n'))
		.concat('\n')

const prettifyCommit = (commit: IRawCommit): string =>
	`- ${commit.description} (${commit.abbrevHash})`
