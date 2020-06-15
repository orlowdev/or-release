import type { Unary } from 'types/common-types'
import { extendWith, tap } from './helpers'

const _fs = Symbol('functions')

interface IPipeStatic {
	of: <TContext, TProcess = TContext>(f: Unary<TProcess, TContext>) => IPipe<TContext, TProcess>
	from: <TContext, TProcess>(...functions: Array<Unary<any>>) => IPipe<TContext, TProcess>
	empty: <TContext, TProcess>() => IPipe<TContext, TProcess>
}

interface IExtendPipeStatic extends IPipeStatic {
	of: <TContext extends Record<string, any>, TProcess = Record<string, unknown>>(
		f: Unary<TProcess, TContext>,
	) => IExtendPipe<TContext, TProcess>
	from: <TContext extends Record<string, any>, TProcess = Record<string, unknown>>(
		...functions: Array<Unary<any>>
	) => IExtendPipe<TContext, TProcess>
	empty: <
		TContext extends Record<string, any> = Record<string, unknown>,
		TProcess = Record<string, unknown>
	>() => IExtendPipe<TContext, TProcess>
}

interface IPipe<TContext, TProcess = TContext> {
	[_fs]: Array<Unary<any>>
	pipe: <TNewContext>(f: Unary<TContext, TNewContext>) => IPipe<TNewContext, TProcess>
	pipeTap: (f: Unary<TContext, any>) => IPipe<TContext, TProcess>
	concat: <TOtherContext>(other: IPipe<TOtherContext, any>) => IPipe<TOtherContext, TProcess>
	process: (initialContext?: TProcess) => TContext
}

interface IExtendPipe<TContext extends Record<string, any>, TProcess = Record<string, unknown>>
	extends IPipe<TContext, TProcess> {
	pipe: <TNewContext>(f: Unary<TContext, TNewContext>) => IExtendPipe<TNewContext, TProcess>
	pipeTap: (f: Unary<TContext, any>) => IExtendPipe<TContext, TProcess>
	pipeExtend: <TNewContext extends Record<string, any>>(
		f: Unary<TContext, TNewContext>,
	) => IExtendPipe<TContext extends TNewContext ? TContext : TContext & TNewContext, TProcess>
	concat: <TOtherContext extends Record<string, any>>(
		other: IPipe<TOtherContext, TContext>,
	) => IExtendPipe<TContext & TOtherContext, TProcess>
}

export const Pipe: IPipeStatic = {
	from: (...functions) => pipe(functions),
	of: (f) => Pipe.from(f),
	empty: () => Pipe.from(),
}

export const pipe = <TContext, TProcess = TContext>(
	fs: Array<Unary<any>>,
): IPipe<TContext, TProcess> => ({
	[_fs]: fs,
	pipe: (f) => Pipe.from(...fs, f),
	pipeTap: (f) => Pipe.from(...fs, tap(f)),
	concat: (other) => Pipe.from(...fs.concat(other[_fs])),
	process: (initialContext) => fs.reduce((result, f) => f(result), initialContext) as any,
})

export const ExtendPipe: IExtendPipeStatic = {
	from: (...functions) => extendPipe(functions),
	of: (f) => ExtendPipe.from(extendWith(f)),
	empty: () => ExtendPipe.from(),
}

export const extendPipe = <
	TContext extends Record<string, any>,
	TProcess = Record<string, unknown>
>(
	fs: Array<Unary<any>>,
): IExtendPipe<TContext, TProcess> => ({
	[_fs]: fs,
	pipe: (f) => ExtendPipe.from(...fs, f),
	pipeExtend: (f) => ExtendPipe.from(...fs, extendWith(f)),
	pipeTap: (f) => ExtendPipe.from(...fs, tap(f)),
	concat: (other) => ExtendPipe.from(...fs.concat(other[_fs])),
	process: (initialContext = {} as TProcess) =>
		fs.reduce((result, f) => f(result), initialContext) as any,
})
