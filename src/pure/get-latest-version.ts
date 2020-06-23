import type { IAppCtx } from 'types/app-ctx'
import type { ILogFunction } from '../types/common-types'
import { Either } from '../utils/either'

interface IGetLatestVersionDeps {
	logWarning: ILogFunction
}

type GetLatestVersionCtx = Pick<IAppCtx, 'latestVersion' | 'allTags' | 'prefix'>

export const getLatestVersion = ({ logWarning }: IGetLatestVersionDeps) => ({
	latestVersion,
	allTags,
	prefix,
}: GetLatestVersionCtx) => ({
	latestVersion: latestVersion
		? latestVersion
		: Either.fromNullable(allTags.find((tag) => makeRx(prefix).test(tag)))
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

const makeRx = (prefix: string) => new RegExp(`^${prefix}\\d+.\\d+.\\d+$`)
