import type { ILogger, IColorizer } from '../utils/logger'
import type { IAppCtx } from '../types/app-ctx'
import type { BumpKey } from '../types/common-types'
import { Either } from '../utils/either'
import { tap } from '../utils/helpers'

interface IMakeNewVersionDeps {
	logger: ILogger
	colors: IColorizer
}

type MakeNewVersionCtx = Pick<IAppCtx, 'latestVersion' | 'prefix' | BumpKey>

export const makeNewVersion = ({ logger, colors }: IMakeNewVersionDeps) => ({
	latestVersion,
	prefix,
	bumpPatch,
	bumpMinor,
	bumpMajor,
}: MakeNewVersionCtx) => ({
	newVersion: Either.fromNullable(/(\d+)\.(\d+)\.(\d+)/.exec(latestVersion))
		.map((tuple) => tuple.slice(1, 4))
		.map((tuple) => tuple.map(Number))
		.map(([major, minor, patch]) => [major, minor, bumpPatch ? patch + 1 : patch])
		.map(([major, minor, patch]) => (bumpMinor ? [major, minor + 1, 0] : [major, minor, patch]))
		.map(([major, minor, patch]) => (bumpMajor ? [major + 1, 0, 0] : [major, minor, patch]))
		.map((tuple) => tuple.join('.'))
		.map((version) => prefix.concat(version))
		.fold(
			() => `${prefix}0.1.0`,
			tap((newVersion) => logger.success(`Version candidate: ${colors.green(newVersion)}`)),
		),
})
