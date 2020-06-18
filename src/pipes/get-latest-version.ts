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
		: execEither(`git describe --match "${prefix}*[0-9].*[0-9].*[0-9]" --abbrev=0 HEAD --tags`)
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
