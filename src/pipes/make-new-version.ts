import type { IAppCtx } from '../types/app-ctx'
import type { BumpKey } from '../types/common-types'
import { Either } from '../utils/either'
import { extractVersionTuple } from '../utils/helpers'

type MakeNewVersionCtx = Pick<IAppCtx, 'latestVersion' | 'prefix' | 'public' | BumpKey>

export const makeNewVersion = ({
	latestVersion,
	prefix,
	public: isPublic,
	bumpPatch,
	bumpMinor,
	bumpMajor,
}: MakeNewVersionCtx) => ({
	newVersion: Either.fromNullable(extractVersionTuple(latestVersion))
		.map((tuple) => tuple.slice(1, 4))
		.map((tuple) => tuple.map(Number))
		.map(([major, minor, patch]) => [major, minor, bumpPatch ? patch + 1 : patch])
		.map(([major, minor, patch]) => (bumpMinor ? [major, minor + 1, 0] : [major, minor, patch]))
		.map(([major, minor, patch]) =>
			bumpMajor && isPublic
				? [major + 1, 0, 0]
				: bumpMajor && !isPublic
				? [major, bumpMajor ? minor : minor + 1, 0]
				: [major, minor, patch],
		)
		.map((tuple) => tuple.join('.'))
		.map((version) => prefix.concat(version))
		.fold(
			() => `${prefix}${isPublic ? '1.0' : '0.1'}.0`,
			(newVersion) => newVersion,
		),
})
