import type { IEither } from '../utils/either'
import type { ILogger, IColorizer } from '../utils/logger'
import type { Unary } from '../types/common-types'
import type { IAppCtx } from 'types/app-ctx'
import { tap } from '../utils/helpers'

interface IGetLatestVersionDeps {
	execEither: Unary<string, IEither<string, Error>>
	logger: ILogger
	colors: IColorizer
}

type GetLatestVersionCtx = Pick<IAppCtx, 'latestVersion'>

export const getLatestVersion = ({ execEither, logger, colors }: IGetLatestVersionDeps) => ({
	latestVersion,
}: GetLatestVersionCtx) => ({
	latestVersion: latestVersion
		? latestVersion
		: execEither('git describe --match "*[0-9].*[0-9].*[0-9]" --abbrev=0 HEAD --tags')
				.leftMap(() =>
					logger.warning(`Could not find previous semantic versions. Using ${colors.yellow('0.0.0')}.`),
				)
				.fold(
					() => '0.0.0',
					tap((latestVersion: string) => logger.info(`Latest version: ${colors.green(latestVersion)}`)),
				),
})
