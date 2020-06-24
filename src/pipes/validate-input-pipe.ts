import type { IAppCtx } from '../types/app-ctx'
import type { LogFatalError } from '../utils/logger'
import { ExtendPipe } from '../utils/pipe'
import { exitIfInvalidBuildMetadata } from '../pure/validators/exit-if-invalid-build-metadata'
import { exitIfInvalidPreRelease } from '../pure/validators/exit-if-invalid-pre-release'

interface IValidateInputPipeDeps {
	logFatalError: LogFatalError
}

export const validateInputPipe = ({ logFatalError }: IValidateInputPipeDeps) =>
	ExtendPipe.empty<IAppCtx, Partial<IAppCtx>>()
		.pipeTap(exitIfInvalidBuildMetadata({ logFatalError }))
		.pipeTap(exitIfInvalidPreRelease({ logFatalError }))
