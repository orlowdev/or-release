import type { IAppCtx } from '../../types/app-ctx'
import { Either } from '../../utils/either'
import { extractVersionTuple } from '../../utils/helpers'

type Ctx = Pick<IAppCtx, 'latestVersion' | 'public'>

export const validatePublic = ({ latestVersion, public: isPublic }: Ctx) => ({
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
