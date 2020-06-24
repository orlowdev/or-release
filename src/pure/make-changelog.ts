import type { IRawCommit } from '../types/raw-commit'
import type { IAppCtx } from '../types/app-ctx'
import { Either } from '../utils/either'
import { IConvention } from '../types/convention'

type Ctx = Pick<IAppCtx, 'newVersion' | 'commitList' | 'conventions'>

export const makeChangelog = ({ newVersion, commitList, conventions }: Ctx) => ({
	changelog: changelogTag`
		# ${newVersion}
		
		## :boom: Breaking changes
		${Either.fromNullable(conventions.find((convention) => convention.bumps === 'major'))
			.chain((convention) =>
				Either.fromNullable(
					commitList.filter((commit) =>
						convention.match.some((match) => new RegExp(match).test(commit.type)),
					),
				).map((commits) => commits.map(prettifyCommit(convention))),
			)
			.fold(
				() => [],
				(commits) => commits,
			)}

		## :sparkles: Features
		${Either.fromNullable(conventions.find((convention) => convention.bumps === 'minor'))
			.chain((convention) =>
				Either.fromNullable(
					commitList.filter((commit) =>
						convention.match.some((match) => new RegExp(match).test(commit.type)),
					),
				).map((commits) => commits.map(prettifyCommit(convention))),
			)
			.fold(
				() => [],
				(commits) => commits,
			)}
		
		## :bug: - :ambulance: - :lock: Fixes
		${Either.fromNullable(conventions.find((convention) => convention.bumps === 'patch'))
			.chain((convention) =>
				Either.fromNullable(
					commitList.filter((commit) =>
						convention.match.some((match) => new RegExp(match).test(commit.type)),
					),
				).map((commits) => commits.map(prettifyCommit(convention))),
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

const prettifyCommit = (convention: IConvention) => (commit: IRawCommit): string =>
	convention.itemDescriptionFormat
		.replace('%commit.type%', commit.type)
		.replace('%commit.description%', commit.description)
		.replace('%commit.abbrevHash%', commit.abbrevHash)
		.replace('%commit.hash%', commit.hash)
		.replace('%commit.author.email%', commit.author.email)
		.replace('%commit.author.name%', commit.author.name)
		.concat(
			commit.body
				? '\n\n'.concat(convention.itemBodyFormat.replace('%commit.body%', commit.body))
				: '',
		)
