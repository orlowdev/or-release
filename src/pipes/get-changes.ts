import type { IAppCtx } from '../types/app-ctx'
import type { Unary } from '../types/common-types'
import type { IRawCommit } from '../types/raw-commit'
import { Either, IEither } from '../utils/either'

interface IGetChangesDeps {
	execEither: Unary<string, IEither<string, Error>>
	logFatalError: Unary<string, Unary<Error, never>>
}

type IGetChangesCtx = Pick<IAppCtx, 'latestVersionCommit'>

export const getChanges = ({ execEither, logFatalError }: IGetChangesDeps) => ({
	latestVersionCommit,
}: IGetChangesCtx) => ({
	commitList: execEither(`git rev-list ${latestVersionCommit}..HEAD --format='${commitFormat}'`)
		.map((changes) => changes.split('\n'))
		.map(filterOutCommitHeadings)
		.map(normalizeChangeString)
		.map((changes) => `[ ${changes} ]`)
		.chain((changes) => Either.try<IRawCommit[], Error>(() => JSON.parse(changes)))
		.map((changes) => changes.map(setCommitType))
		.fold(logFatalError('Could not get changes since previous release.'), (changes) =>
			changes.reverse(),
		),
})

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

const setCommitType = (rawCommit: IRawCommit): IRawCommit => ({
	...rawCommit,
	type: /^(:.*:)/.exec(rawCommit.description)
		? (/^(:.*:)/.exec(rawCommit.description) as any)[0]
		: ':construction:', // TODO
	description: rawCommit.description.replace(/^:.*:\s+/, ''),
})
