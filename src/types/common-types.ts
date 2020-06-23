export type Thunk<T> = () => T

export type Unary<TArg, TReturn = TArg> = (x: TArg) => TReturn

export type Version = 'patch' | 'minor' | 'major' | null

export type MergeEvaluationStrategy = 'include' | 'exclude' | 'only'

export type ReleaseTransport = 'git' | 'bitbucket' | 'github' | 'gitlab'

export type Email = string

export type BumpKey = 'bumpPatch' | 'bumpMinor' | 'bumpMajor'

export type Conventions = Record<BumpKey, string[]>
