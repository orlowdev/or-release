import type { IAppCtx } from '../types/app-ctx'
import { Either } from '../utils/either'
import { extractVersionTuple } from '../utils/helpers'

type SetPublicOptionCtx = Pick<IAppCtx, 'latestVersion' | 'public'>

export const setPublicOption = ({ latestVersion, public: isPublic }: SetPublicOptionCtx) => ({
	public: isPublic
		? isPublic
		: Either.fromNullable(extractVersionTuple(latestVersion))
				.map(([_, major]) => major)
				.map(Number)
				.fold(
					() => isPublic,
					(major) => major > 0,
				),
})
