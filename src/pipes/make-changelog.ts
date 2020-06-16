import { IRawCommit } from '../types/raw-commit'
import { IAppCtx } from '../types/app-ctx'

const changelogTag = (
	_: TemplateStringsArray,
	version: string,
	breakingChanges: string[],
	features: string[],
	fixes: string[],
) =>
	`# ${version}`
		.concat(breakingChanges.length > 0 ? '\n\n## :boom: Breaking Changes\n\n' : '')
		.concat(breakingChanges.join('\n'))
		.concat(features.length > 0 ? '\n\n## :sparkles: Features\n\n' : '')
		.concat(features.join('\n'))
		.concat(fixes.length > 0 ? '\n\n## :bug: ∘ :ambulance: ∘ :lock: Fixes\n\n' : '')
		.concat(fixes.join('\n'))
		.concat('\n')

const prettifyCommit = (commit: IRawCommit): string =>
	`- ${commit.description} (${commit.abbrevHash})`

interface IMakeChangelogDeps {
	conventions: any
}

type MakeChangelogCtx = Pick<IAppCtx, 'newVersion' | 'commitList'>

export const makeChangelog = ({ conventions }: IMakeChangelogDeps) => ({
	newVersion,
	commitList,
}: MakeChangelogCtx) => ({
	changelog: changelogTag`
		## ${newVersion}
		
		### :boom: Breaking changes
		${commitList.filter((commit) => conventions.bumpMajor.includes(commit.type)).map(prettifyCommit)}
		
		### :sparkles: Features
		${commitList.filter((commit) => conventions.bumpMinor.includes(commit.type)).map(prettifyCommit)}
		
		### :bug: - :ambulance: - :lock: Fixes
		${commitList.filter((commit) => conventions.bumpPatch.includes(commit.type)).map(prettifyCommit)}
	`,
})

/*
Const trimType = convention => change =>
  change.replace(new RegExp(convention), "")

const getMatchingChanges = (convention, changes) =>
  changes.filter(testConvention(convention)).map(trimType(convention))

const writeToChangelog = (title, items) =>
  items.length
    ? `\n## ${title}\n\n${items
        .map(change => `* ${change}\n`)
        .join("")}`
    : ""

const changelogTag = (_, version, breaks, features, fixes) =>
  `# ${version}\n`
    .concat(writeToChangelog("Breaking Changes", breaks))
    .concat(writeToChangelog("Features & Deprecations", features))
    .concat(writeToChangelog("Bug Fixes", fixes))

export const MakeChangelog = ExtendPipe(
  ({ changes, newVersion, conventions }) => ({
    changelog: changelogTag`
  # ${newVersion}
  ## Breaking Changes
  ${getMatchingChanges(conventions.major, changes)}
  ## Features & Deprecations
  ${getMatchingChanges(conventions.minor, changes)}
  ## Bug Fixes
  ${getMatchingChanges(conventions.patch, changes)}
`,
  }),
)
 */
