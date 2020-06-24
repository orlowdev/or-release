import type { IRawCommit } from '../types/raw-commit'
import type { IAppCtx } from '../types/app-ctx'
import { Either } from '../utils/either'

type Ctx = Pick<IAppCtx, 'newVersion' | 'commitList' | 'conventions'>

export const makeChangelog = ({ newVersion, commitList, conventions }: Ctx) => ({
	changelog: changelogTag`
		# ${newVersion}
		
		## :boom: Breaking changes
		${Either.fromNullable(conventions.find((convention) => convention.bumps === 'patch'))
			.map((convention) =>
				commitList.filter((commit) => convention.match.includes(commit.type)).map(prettifyCommit),
			)
			.fold(
				() => [],
				(commits) => commits,
			)}

		## :sparkles: Features
		${Either.fromNullable(conventions.find((convention) => convention.bumps === 'minor'))
			.map((convention) =>
				commitList.filter((commit) => convention.match.includes(commit.type)).map(prettifyCommit),
			)
			.fold(
				() => [],
				(commits) => commits,
			)}
		
		## :bug: - :ambulance: - :lock: Fixes
		${Either.fromNullable(conventions.find((convention) => convention.bumps === 'major'))
			.map((convention) =>
				commitList.filter((commit) => convention.match.includes(commit.type)).map(prettifyCommit),
			)
			.fold(
				() => [],
				(commits) => commits,
			)}
	`,
})

// ------------------------------------------------------------------------------------------------

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
