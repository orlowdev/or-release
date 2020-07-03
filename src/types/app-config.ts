import type { IConvention } from './convention'
import type { MergeEvaluationStrategy, Email, ReleaseTransport } from './common-types'

/**
 * Externally configurable behaviour of the application.
 */
export interface IAppConfig {
	/**
	 * Token to authenticate user executing version bumping.
	 *
	 * @default ""
	 */
	token: string

	/**
	 * User executing version bumping.
	 *
	 * @default ""
	 */
	user: string

	/**
	 * Execute the command but do not publish the version.
	 *
	 * @default false
	 */
	dryRun: boolean

	/**
	 * Version tag to evaluate commits from.
	 *
	 * Defaults to the latest SemVer tag.
	 */
	latestVersion: string

	/**
	 * Path to versioning config file.
	 *
	 * File notation/language is resolved from the file extension.
	 * @priestine/versioning uses the following parsers:
	 *
	 * - .json | .yaml | .yml => YAML
	 * - .toml => TOML
	 * - .*rc => TOML -> YAML
	 *
	 * @note In most cases, JSON is valid YAML but keep caveats in mind
	 * @see https://metacpan.org/pod/JSON::XS#JSON-and-YAML
	 */
	configFile: string

	/**
	 * Commit types that are important for the application (either for
	 * bumping of for the docs).
	 */
	conventions: IConvention[]

	/**
	 * Transport for delivering releases. If set to "github" or "gitlab",
	 * apart from creating a git tag, @priestine/versioning will also
	 * create a release.
	 *
	 * Bitbucket is just an alias for "git" and it only creates a git tag.
	 *
	 * @default "git"
	 */
	transport: ReleaseTransport

	/**
	 * Custom URL for using selected transport (useful for on-premise
	 * instances of GL or GH).
	 *
	 * This value is ignored for "git" and "bitbucket" transports.
	 */
	customUrl: string

	/**
	 * Custom prefix for Semantic Version, e.g. "v"
	 *
	 * @default ""
	 */
	prefix: string

	/**
	 * Strategy for evaluating merge commits.
	 */
	merges: MergeEvaluationStrategy

	/**
	 * Configure writing changelog to the tag message.
	 *
	 * @default true
	 */
	writeChangelogToTag: boolean

	/**
	 * Configure writing changelog to files. @priestine/versioning will
	 * APPEND new data to the changelog.
	 *
	 * @default []
	 */
	writeChangelogToFile: string[]

	/**
	 * Configure writing changelog to files so that new changes are
	 * prepended to the file instead of being appended to it.
	 *
	 * @default false
	 */
	prependChangelogToFile: boolean

	/**
	 * Configure branch when writing changelog to files.
	 * Defaults to current branch.
	 */
	branch: string

	/**
	 * Name of the user to sign the release. Defaults to IAppConfig user.
	 */
	tagAuthorName: string

	/**
	 * Email of the user to sign the release.
	 *
	 * @default ""
	 */
	tagAuthorEmail: Email

	/**
	 * Configure declaring public API.
	 * If set to false, the version will be published with major 0. All
	 * major changes will update MINOR version.
	 *
	 * This option is ignored if major version "1" was already released.
	 *
	 * @default true
	 */
	public: boolean

	/**
	 * Pre-release postfix to be associated with the release, e.g -rc,
	 * -alpha, -beta, etc. The - sign at the beginning is optional. If it
	 * is not there, @priestine/versioning will add it automatically.
	 * @priestine/versioning also automatically adds .# at the end of the
	 * pre-release so provided pre-release "rc" becomes "-rc.1". If
	 * subsequent releases get the same version and the same pre-release,
	 * the number increments ("-alpha.1" -> "-alpha.2").
	 *
	 * @see https://semver.org/#spec-item-9
	 *
	 * @default ""
	 */
	preRelease: string

	/**
	 * Build metadata to be associated with the release, e.g. +1fabaf1,
	 * +01012020, etc.
	 *
	 * @see https://semver.org/#spec-item-10
	 *
	 * @default ""
	 */
	buildMetadata: string

	/**
	 * Force bumping patch version even if it is not required by the
	 * change types. Note that this MAY negatively affect the changelog
	 * as there might be no records for the release.
	 *
	 * @default false
	 */
	bumpPatch: boolean

	/**
	 * Force bumping minor version even if it is not required by the
	 * change types. Note that this MAY negatively affect the changelog
	 * as there might be no records for the release.
	 *
	 * @default false
	 */
	bumpMinor: boolean

	/**
	 * Force bumping major version even if it is not required by the
	 * change types. Note that this MAY negatively affect the changelog
	 * as there might be no records for the release.
	 *
	 * @default false
	 */
	bumpMajor: boolean

	/**
	 * Repository path, e.g. "priestine/semantics". This value is needed
	 * when API is used for publishing releases to GitHub or GitLab. In
	 * most cases, it can be taken from an environment variable in your
	 * CI tool.
	 *
	 * @default ""
	 */
	repository: string

	/**
	 * Enable showing the produced changelog in the console.
	 *
	 * @default false
	 */
	showChangelog: boolean

	/**
	 * Force resetting major version to 1 on prefix change.
	 *
	 * @default false
	 */
	prefixReset: boolean
}
