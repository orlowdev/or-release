import type { IAppCtx } from 'types/app-ctx'
import type { LogFunction } from '../../utils/logger'
import { Either } from '../../utils/either'

interface IDeps {
	logWarning: LogFunction
}

type Ctx = Pick<IAppCtx, 'latestVersion' | 'allTags' | 'noTrailingZeroes'>

export const getLatestVersion = ({ logWarning }: IDeps) => ({
	latestVersion,
	allTags,
	noTrailingZeroes,
}: Ctx) => ({
	latestVersion:
		latestVersion ||
		Either.fromNullable(
			allTags.find((tag) =>
				noTrailingZeroes
					? /^(\w+)?\d+\.?(\d+)?\.?(\d+)?$/.test(tag)
					: /^(\w+)?\d+\.\d+\.\d+$/.test(tag),
			),
		)
			.leftMap(
				() =>
					/* istanbul ignore next */
					logWarning`Could not find previous semantic versions. Using ${({ y }) => y('0.0.0')}.`,
			)
			.fold(
				() => '0.0.0',
				(latestVersion) => latestVersion,
			),
})
