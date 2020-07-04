import type { IAppCtx } from '../types/app-ctx'

export const removeTrailingZeroes = ({
	newVersion,
	noTrailingZeroes,
}: Pick<IAppCtx, 'newVersion' | 'noTrailingZeroes'>) => ({
	newVersion:
		noTrailingZeroes && newVersion.endsWith('.0') ? newVersion.replace(/\.0$/, '') : newVersion,
})
