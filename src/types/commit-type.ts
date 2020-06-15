import { Version } from './common-types'

export interface ICommitType {
	match: string
	groupFormat: string
	descriptionFormat: string
	bodyFormat: string
	bumps: Version
}
