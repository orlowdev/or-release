import type { IAppCtx } from '../types/app-ctx'
import type { IEither } from '../utils/either'
import { Either } from '../utils/either'
import type { Unary } from '../types/common-types'
import type { ILogger, IColorizer } from '../utils/logger'
import { errorToString, tap } from '../utils/helpers'
import { IRawCommit } from '../types/raw-commit'

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

interface IGetChangesDeps {
	execEither: Unary<string, IEither<string, Error>>
	processExit: Unary<number, never>
	logger: ILogger
	colors: IColorizer
}

type IGetChangesCtx = Pick<IAppCtx, 'latestVersionCommit'>

export const getChanges = ({ execEither, processExit, logger, colors }: IGetChangesDeps) => ({
	latestVersionCommit,
}: IGetChangesCtx) => ({
	commitList: execEither(`git rev-list ${latestVersionCommit}..HEAD --format='${commitFormat}'`)
		.map((changes) => changes.split('\n'))
		.map(filterOutCommitHeadings)
		.map(normalizeChangeString)
		.map((changes) => `[ ${changes} ]`)
		.chain((changes) => Either.try<IRawCommit[], Error>(() => JSON.parse(changes)))
		.bimap(
			tap(() => logger.error('Could not get recent changes due to error:')),
			(changes) => changes.map(setCommitType),
		)
		.bimap(
			(error: Error) => logger.error(errorToString(error)),
			tap((changes: IRawCommit[]) =>
				logger.info(`Changes found since previous version: ${colors.green(String(changes.length))}`),
			),
		)
		.fold(
			() => processExit(1),
			(changes) => changes.reverse(),
		),
})
