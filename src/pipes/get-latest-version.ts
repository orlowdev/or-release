import type { IAppCtx } from 'types/app-ctx'
import type { ILogFunction, Unary } from '../types/common-types'
import type { IEither } from '../utils/either'

interface IGetLatestVersionDeps {
	execEither: Unary<string, IEither<string, Error>>
	logWarning: ILogFunction
}

type GetLatestVersionCtx = Pick<IAppCtx, 'latestVersion' | 'prefix'>

export const getLatestVersion = ({ execEither, logWarning }: IGetLatestVersionDeps) => ({
	latestVersion,
	prefix,
}: GetLatestVersionCtx) => ({
	latestVersion: latestVersion
		? latestVersion
		: execEither('git show-ref --tags')
				.map((string) => string.split('\n'))
				.map((strings) => strings.map((string) => string.replace(/.*refs\/tags\//, '')))
				.map((tags) => tags.reverse())
				.map((tags) => tags[0])
				.leftMap(
					() =>
						logWarning`Could not find previous semantic versions. Using ${({ yellow }) =>
							yellow(`${prefix}0.0.0`)}.`,
				)
				.fold(
					() => `${prefix}0.0.0`,
					(latestVersion) => latestVersion,
				),
})
