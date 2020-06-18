export type Thunk<T> = () => T

export type Unary<TArg, TReturn = TArg> = (x: TArg) => TReturn

export type Version = 'patch' | 'minor' | 'major' | null

export type MergeEvaluationStrategy = 'include' | 'exclude' | 'only'

export type ReleaseTransport = 'git' | 'bitbucket' | 'github' | 'gitlab'

export type Email = string

export type BumpKey = 'bumpPatch' | 'bumpMinor' | 'bumpMajor'

export type Conventions = Record<BumpKey, string[]>

export interface ILogger {
	error: Unary<string, void>
	warning: Unary<string, void>
	info: Unary<string, void>
	success: Unary<string, void>
}

export interface IColorizer {
	red: Unary<string>
	yellow: Unary<string>
	green: Unary<string>
	blue: Unary<string>
}

export type ILogFunction = (
	strings: TemplateStringsArray,
	...values: Array<Unary<IColorizer, string> | string | number | boolean>
) => void
