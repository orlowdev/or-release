import type { IAppCtx } from '../../types/app-ctx'
import type { Unary } from '../../types/common-types'
import type { IRawCommit } from '../../types/raw-commit'
import type { LogFatalError } from '../../utils/logger'
import { Either, IEither } from '../../utils/either'
import { IConvention } from '../../types/convention'

interface IDeps {
	execEither: Unary<string, IEither<string, Error>>
	logFatalError: LogFatalError
}

type Ctx = Pick<IAppCtx, 'latestVersionCommit' | 'merges' | 'conventions'>

export const getChanges = ({ execEither, logFatalError }: IDeps) => ({
	latestVersionCommit,
	merges,
	conventions,
}: Ctx) => ({
	commitList: execEither(
		'git rev-list'
			.concat(merges === 'only' ? ' --merges' : '')
			.concat(merges === 'exclude' ? ' --no-merges' : '')
			.concat(` ${latestVersionCommit}..HEAD`)
			.concat(` --format='${commitFormat}'`),
	)
		.map((changes) => changes.split('\n'))
		.map(filterOutCommitHeadings)
		.map(normalizeChangeString)
		.map((changes) => `[ ${changes} ]`)
		.chain((changes) => Either.try<IRawCommit[], Error>(() => JSON.parse(changes)))
		.map((changes) => changes.map(setCommitType(conventions)))
		.fold(logFatalError('Could not get changes since previous release.'), (changes) =>
			changes.reverse(),
		),
})

// ------------------------------------------------------------------------------------------------

/**
 * Git commit format template.
 */
export const commitFormat: string =
	'{' +
	'^^^hash^^^: ^^^%H^^^,' +
	'^^^abbrevHash^^^: ^^^%h^^^,' +
	'^^^author^^^: {' +
	'^^^name^^^: ^^^%aN^^^,' +
	'^^^email^^^: ^^^%aE^^^' +
	'},' +
	'^^^description^^^: ^^^%s^^^,' +
	'^^^body^^^: ^^^%b^^^' +
	'}'

const filterOutCommitHeadings = (changes: string[]) =>
	changes.filter((change) => !change.startsWith('commit'))

const normalizeChangeString = (changes: string[]) =>
	changes.map((line) => line.replace(/"/g, "'").replace(/\n/g, '').replace(/\^{3}/g, '"')).join(', ')

const setCommitType = (conventions: IConvention[]) => (rawCommit: IRawCommit): IRawCommit => {
	return {
		...rawCommit,
		type: Either.fromNullable(
			conventions.reduce(
				(acc, convention) =>
					convention.match.find(
						(match) =>
							new RegExp(match).test(rawCommit.description) || new RegExp(match).test(rawCommit.body),
					) ?? acc,
				'',
			),
		)
			.chain((match) =>
				Either.fromNullable(
					new RegExp(match).exec(
						new RegExp(match).test(rawCommit.description) ? rawCommit.description : rawCommit.body,
					),
				),
			)
			.fold(
				() => '',
				(match) => match[0].trim(),
			),
		description: Either.fromNullable(
			conventions.reduce(
				(acc, convention) =>
					convention.match.find((match) => new RegExp(match).test(rawCommit.description)) ?? acc,
				'',
			),
		)
			.chain((match) => Either.fromNullable(match || null))
			.map((match) =>
				rawCommit.description.replace(
					new RegExp(match.endsWith('\\s') ? match : match.concat('\\s')),
					'',
				),
			)
			.fold(
				() => rawCommit.description,
				(match) => match,
			),
	}
}
