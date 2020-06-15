import type { IEither } from '../utils/either'
import type { ILogger } from '../utils/logger'
import type { Unary } from '../types/common-types'
import { tap } from '../utils/helpers'

interface IGetLatestVersionDeps {
	execEither: Unary<string, IEither<string, Error>>
	logger: ILogger
}

export const getLatestVersion = ({ execEither, logger }: IGetLatestVersionDeps) => () => ({
	latestVersion: execEither('git describe --match "*[0-9].*[0-9].*[0-9]" --abbrev=0 HEAD --tags')
		.leftMap(() =>
			logger.warning(`Could not find previous semantic versions. Using ${logger.orange('0.0.0')}.`),
		)
		.fold(
			() => '0.0.0',
			tap((latestVersion: string) => logger.info(`Latest version: ${logger.green(latestVersion)}`)),
		),
})
