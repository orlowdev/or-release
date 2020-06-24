import type { IAppCtx } from '../types/app-ctx'
import { Either } from '../utils/either'

type Ctx = Pick<IAppCtx, 'newVersion' | 'preRelease' | 'allTags'>

export const addPreRelease = ({ newVersion, preRelease, allTags }: Ctx) => ({
	newVersion: preRelease
		? Either.fromNullable(
				allTags.find((tag) => new RegExp(`${newVersion}-${preRelease}\\.\\d+`).test(tag)),
		  )
				.chain((tag) => Either.fromNullable(tag?.split('.').slice(-1)[0]))
				.map(Number)
				.fold(
					() => `${newVersion}-${preRelease}.1`,
					(latestPreRelease) => `${newVersion}-${preRelease}.${latestPreRelease + 1}`,
				)
		: newVersion,
})
