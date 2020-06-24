import type { IAppCtx } from 'types/app-ctx'
import type { LogFunction } from '../../utils/logger'
import { Either } from '../../utils/either'

interface IDeps {
	logWarning: LogFunction
}

type Ctx = Pick<IAppCtx, 'latestVersion' | 'allTags'>

export const getLatestVersion = ({ logWarning }: IDeps) => ({ latestVersion, allTags }: Ctx) => ({
	latestVersion: latestVersion
		? latestVersion
		: Either.fromNullable(allTags.find((tag) => /^(\w+)?\d+\.\d+\.\d+$/.test(tag)))
				.leftMap(
					() => logWarning`Could not find previous semantic versions. Using ${({ y }) => y('0.0.0')}.`,
				)
				.fold(
					() => '0.0.0',
					(latestVersion) => latestVersion,
				),
})
