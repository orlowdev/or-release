import { IAppConfig } from './app-config'
import { IRawCommit } from './raw-commit'

export interface IAppCtx extends IAppConfig {
	commitList: IRawCommit[]
	latestVersionCommit: string
	currentCommit: string
}
