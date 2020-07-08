import type { Except } from 'type-fest'
import type { IRawCommit } from '../types/raw-commit'
import type { IAppCtx } from '../types/app-ctx'
import type { IConvention } from '../types/convention'
import type { Version } from '../types/common-types'
import { Either } from '../utils/either'

type Ctx = Pick<IAppCtx, 'newVersion' | 'commitList' | 'conventions'>

export const makeChangelog = ({ newVersion, commitList, conventions }: Ctx) => ({
	changelog: `# ${newVersion}`
		.concat(getChangelogOfType('major', { commitList, conventions }).join('\n'))
		.concat(getChangelogOfType('minor', { commitList, conventions }).join('\n'))
		.concat(getChangelogOfType('patch', { commitList, conventions }).join('\n'))
		.concat(getChangelogOfType(null, { commitList, conventions }).join('\n'))
		.concat('\n\n'),
})

// ------------------------------------------------------------------------------------------------

const getChangelogOfType = (
	type: Version,
	{ conventions, commitList }: Except<Ctx, 'newVersion'>,
) =>
	Either.fromNullable(conventions.find((convention) => convention.bumps === type))
		.chain((convention) =>
			Either.right(
				commitList.filter((commit) =>
					convention.match.some((match) => new RegExp(match).test(commit.type)),
				),
			).map((commits) =>
				[
					commits.length > 0 ? convention.groupTitleFormat : '',
					commits.length > 0 ? convention.groupDescription : '',
				]
					.filter(Boolean)
					.concat(commits.map(prettifyCommit(convention))),
			),
		)
		.fold(
			() => [],
			(commits) => commits,
		)

const prettifyCommit = (convention: IConvention) => (commit: IRawCommit): string =>
	convention.itemDescriptionFormat
		.replace('%commit.type%', commit.type)
		.replace('%commit.description%', commit.description)
		.replace('%commit.abbrevHash%', commit.abbrevHash)
		.replace('%commit.hash%', commit.hash)
		.replace('%commit.author.email%', commit.author.email)
		.replace('%commit.author.name%', commit.author.name)
		.concat(prettifyCommitBody(commit.body, convention.itemBodyFormat))

const prettifyCommitBody = (commitBody: string, bodyFormat: string) => {
	const cleanCommitBody = commitBody
		.split(', ')
		.filter(filterOutIssueReferences)
		.filter(Boolean)
		.join(', ')

	return cleanCommitBody ? '\n\n'.concat(bodyFormat.replace('%commit.body%', cleanCommitBody)) : ''
}

const filterOutIssueReferences = (bodyLine: string) =>
	!/clos(e|ed|es|ing)\s.*(#|http)/i.test(bodyLine) &&
	!/resolv(e|ed|es|ing)\s.*(#|http)/i.test(bodyLine) &&
	!/fix(ed|es|ing)?\s.*(#|http)/i.test(bodyLine) &&
	!/implement(ed|es|ing)?\s.*(#|http)/i.test(bodyLine)
