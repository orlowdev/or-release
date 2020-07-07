import type { Version } from './common-types'

export interface IConvention {
	match: string[]
	groupTitleFormat: string
	groupDescription?: string
	itemDescriptionFormat: string
	itemBodyFormat: string
	bumps: Version
}
