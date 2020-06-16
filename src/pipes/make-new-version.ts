import type { ILogger, IColorizer } from '../utils/logger'
import type { IAppCtx } from '../types/app-ctx'
import type { BumpKey } from '../types/common-types'
import { Either } from '../utils/either'
import { tap } from '../utils/helpers'

interface IMakeNewVersionDeps {
	logger: ILogger
	colors: IColorizer
}

type MakeNewVersionCtx = Pick<IAppCtx, 'latestVersion' | BumpKey>

// TODO: Clean up imports and type/interface consistency

export const makeNewVersion = ({ logger, colors }: IMakeNewVersionDeps) => ({
	latestVersion,
	bumpPatch,
	bumpMinor,
	bumpMajor,
}: MakeNewVersionCtx) => ({
	newVersion: Either.right(latestVersion)
		.map((latestVersion) => latestVersion.split('.'))
		.map((tuple) => tuple.map(Number))
		// TODO: ♻️ + proper extraction of \d+\.\d+\.\d+
		.map(([major, minor, patch]) => [major, minor, bumpPatch ? patch + 1 : patch])
		.map(([major, minor, patch]) => (bumpMinor ? [major, minor + 1, 0] : [major, minor, patch]))
		.map(([major, minor, patch]) => (bumpMajor ? [major + 1, 0, 0] : [major, minor, patch]))
		.map((tuple) => tuple.join('.'))
		.fold(
			// TODO: Logging on error
			() => '0.1.0',
			tap((newVersion) => logger.success(`Version candidate: ${colors.green(newVersion)}`)),
		),
})
