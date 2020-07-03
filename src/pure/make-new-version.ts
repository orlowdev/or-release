import type { IAppCtx } from '../types/app-ctx'
import type { BumpKey } from '../types/common-types'
import { Either } from '../utils/either'
import { extractVersionTuple } from '../utils/helpers'

type Ctx = Pick<IAppCtx, 'latestVersion' | 'public' | 'prefixReset' | 'prefix' | BumpKey>

export const makeNewVersion = ({
	latestVersion,
	public: isPublic,
	prefixReset,
	prefix,
	bumpPatch,
	bumpMinor,
	bumpMajor,
}: Ctx) => ({
	newVersion: Either.fromNullable(extractVersionTuple(latestVersion))
		.map((tuple) => tuple.slice(1, 4))
		.map((tuple) => tuple.map(Number))
		.map((tuple) => tuple.map((x) => (Number.isNaN(x) ? 0 : x)))
		.map(([major, minor, patch]) => [major, minor, bumpPatch ? patch + 1 : patch])
		.map(([major, minor, patch]) => (bumpMinor ? [major, minor + 1, 0] : [major, minor, patch]))
		.map(([major, minor, patch]) =>
			bumpMajor && isPublic
				? [major + 1, 0, 0]
				: bumpMajor && !isPublic
				? [major, bumpMajor ? minor : minor + 1, 0]
				: [major, minor, patch],
		)
		.map((result) => (prefixReset && !latestVersion.startsWith(prefix) ? [1, 0, 0] : result))
		.map((tuple) => tuple.join('.'))
		.fold(
			() => `${isPublic ? '1.0' : '0.1'}.0`,
			(x) => x,
		),
})
