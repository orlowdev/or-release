import type { IAppCtx } from '../types/app-ctx'
import type { IRawCommit } from '../types/raw-commit'
import type { BumpKey, Conventions } from '../types/common-types'
import type { LogFunction } from '../utils/logger'
import { Either } from '../utils/either'
import { tap } from '../utils/helpers'

interface IForceBumpingDeps {
	key: BumpKey
	logInfo: LogFunction
	conventions: Conventions
}

type ForceBumpingCtx = Pick<IAppCtx, 'commitList' | BumpKey>

export const forceBumping = ({ key, logInfo, conventions }: IForceBumpingDeps) => (
	ctx: ForceBumpingCtx,
) => ({
	[key]: Either.right(ctx.commitList)
		.chain(commitsOrNull(conventions[key]))
		.map(
			tap(
				(commits) => logInfo`${key.replace('bump', '')} level changes: ${({ g }) => g(commits.length)}`,
			),
		)
		.fold(
			() => ctx[key],
			() => true,
		),
})

const commitsOrNull = (convention: string[]) => (commits: IRawCommit[]) => {
	const thisType = commits.filter((commit) => convention.includes(commit.type))
	return thisType.length > 0
		? Either.right<IRawCommit[]>(thisType)
		: Either.left<null, IRawCommit[]>(null)
}
