import type { IAppConfig } from './app-config'
import type { IRawCommit } from './raw-commit'

export interface IAppCtx extends IAppConfig {
	commitList: IRawCommit[]
	latestVersionCommit: string
	currentCommit: string
	newVersion: string
}
