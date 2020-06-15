import { IAppCtx } from '../types/app-ctx'

type IForceVersionBumpingCtx = Pick<IAppCtx, 'commitList' | 'bumpPatch' | 'bumpMinor' | 'bumpMajor'>

const conventions = {
	bumpPatch: [':ambulance:', ':bug:', ':lock:'],
	bumpMinor: [':sparkles:'],
	bumpMajor: [':boom:'],
}

export const forceBumping = (key: 'bumpPatch' | 'bumpMinor' | 'bumpMajor') => (
	ctx: IForceVersionBumpingCtx,
) => ({
	[key]: ctx.commitList.some((commit) => conventions[key].includes(commit.type) || ctx[key]),
})
