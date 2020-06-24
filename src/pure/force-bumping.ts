import type { IAppCtx } from '../types/app-ctx'
import type { BumpKey } from '../types/common-types'
import type { LogFunction } from '../utils/logger'
import { Either } from '../utils/either'
import { tap } from '../utils/helpers'

interface IDeps {
	key: BumpKey
	logInfo: LogFunction
}

type Ctx = Pick<IAppCtx, 'commitList' | 'conventions' | BumpKey>

export const forceBumping = ({ key, logInfo }: IDeps) => (ctx: Ctx) => ({
	[key]: Either.right(ctx.commitList)
		.chain((commits) =>
			Either.fromNullable(
				ctx.conventions.find((convention) => convention.bumps === key.slice(4).toLowerCase()),
			).chain((convention) =>
				Either.fromNullable(
					convention.match.find((match) =>
						commits.some((commit) => new RegExp(match).test(commit.type)),
					),
				),
			),
		)
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
