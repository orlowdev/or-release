import test from 'ava'
import { getChanges, commitFormat } from '../../../src/pure/getters/get-changes'
import { Either } from '../../../src/utils/either'
import { spy } from 'sinon'

test('getChanges properly selects only merges', (t) => {
	const execEither: any = spy((cmd: string) => Either.right(cmd))
	const spyLog: any = spy()

	getChanges({ execEither, logFatalError: () => spyLog })({
		latestVersionCommit: '123123',
		merges: 'only',
		conventions: [],
	})

	t.true(execEither.calledWith(`git rev-list --merges 123123..HEAD --format='${commitFormat}'`))
})

test('getChanges properly excludes merges', (t) => {
	const execEither: any = spy((cmd: string) => Either.right(cmd))
	const spyLog: any = spy()

	getChanges({ execEither, logFatalError: () => spyLog })({
		latestVersionCommit: '123123',
		merges: 'exclude',
		conventions: [],
	})

	t.true(execEither.calledWith(`git rev-list --no-merges 123123..HEAD --format='${commitFormat}'`))
})

test('getChanges properly includes merges', (t) => {
	const execEither: any = spy((cmd: string) => Either.right(cmd))
	const spyLog: any = spy()

	getChanges({ execEither, logFatalError: () => spyLog })({
		latestVersionCommit: '123123',
		merges: 'include',
		conventions: [],
	})

	t.true(execEither.calledWith(`git rev-list 123123..HEAD --format='${commitFormat}'`))
})

test('getChanges logs fatal error and exits if it could not extract changes', (t) => {
	const execEither: any = () =>
		Either.right(
			'commit 123123123123123\n{^^^hash^^^: ^^^123123123123123^^^,^^^abbrevHash^^^: ^^^1231231^^^,^^^author^^^: {^^^name^^^: ^^^test^^^,^^^email^^^: ^^^email^^^},^^^description^^^: ^^^some commit message^^^,^^^body^^^: ^^^body lies here^^^}',
		)
	const spyLog: any = spy()
	t.deepEqual(
		getChanges({ execEither, logFatalError: () => spyLog })({
			latestVersionCommit: '123',
			merges: 'only',
			conventions: [],
		}),
		{
			commitList: [
				{
					hash: '123123123123123',
					abbrevHash: '1231231',
					author: {
						name: 'test',
						email: 'email',
					},
					description: 'some commit message',
					body: 'body lies here',
					type: '',
				},
			],
		},
	)
})

test('getChanges properly extracts commit type from commit description', (t) => {
	const execEither: any = () =>
		Either.right(
			'commit 123123123123123\n{^^^hash^^^: ^^^123123123123123^^^,^^^abbrevHash^^^: ^^^1231231^^^,^^^author^^^: {^^^name^^^: ^^^test^^^,^^^email^^^: ^^^email^^^},^^^description^^^: ^^^:boom: some commit message^^^,^^^body^^^: ^^^body lies here^^^}\ncommit 123123223123123\n{^^^hash^^^: ^^^123123223123123^^^,^^^abbrevHash^^^: ^^^1231232^^^,^^^author^^^: {^^^name^^^: ^^^test^^^,^^^email^^^: ^^^email^^^},^^^description^^^: ^^^:sparkles: another commit message^^^,^^^body^^^: ^^^^^^}\ncommit 123123323123123\n{^^^hash^^^: ^^^123123233123123^^^,^^^abbrevHash^^^: ^^^1231233^^^,^^^author^^^: {^^^name^^^: ^^^test^^^,^^^email^^^: ^^^email^^^},^^^description^^^: ^^^:bug: another commit message^^^,^^^body^^^: ^^^^^^}',
		)
	const spyLog: any = spy()
	t.deepEqual(
		getChanges({ execEither, logFatalError: () => spyLog })({
			latestVersionCommit: '123',
			merges: 'only',
			conventions: [
				{
					match: ['^:boom:'],
				} as any,
				{
					match: ['^:bug:\\s'],
				} as any,
				{
					match: ['^:ignoredone:\\s'],
				} as any,
			],
		}),
		{
			commitList: [
				{
					hash: '123123233123123',
					abbrevHash: '1231233',
					author: {
						name: 'test',
						email: 'email',
					},
					description: 'another commit message',
					body: '',
					type: ':bug:',
				},
				{
					hash: '123123223123123',
					abbrevHash: '1231232',
					author: {
						name: 'test',
						email: 'email',
					},
					description: ':sparkles: another commit message',
					body: '',
					type: '',
				},
				{
					hash: '123123123123123',
					abbrevHash: '1231231',
					author: {
						name: 'test',
						email: 'email',
					},
					description: 'some commit message',
					body: 'body lies here',
					type: ':boom:',
				},
			],
		},
	)
})

test('getChanges properly extracts commit type from commit body', (t) => {
	const execEither: any = () =>
		Either.right(
			'commit 123123123123123\n{^^^hash^^^: ^^^123123123123123^^^,^^^abbrevHash^^^: ^^^1231231^^^,^^^author^^^: {^^^name^^^: ^^^test^^^,^^^email^^^: ^^^email^^^},^^^description^^^: ^^^some commit message^^^,^^^body^^^: ^^^BREAKING CHANGE: body lies here^^^}',
		)
	const spyLog: any = spy()
	t.deepEqual(
		getChanges({ execEither, logFatalError: () => spyLog })({
			latestVersionCommit: '123',
			merges: 'only',
			conventions: [
				{
					match: ['^BREAKING CHANGE:\\s'],
				} as any,
			],
		}),
		{
			commitList: [
				{
					hash: '123123123123123',
					abbrevHash: '1231231',
					author: {
						name: 'test',
						email: 'email',
					},
					description: 'some commit message',
					body: 'BREAKING CHANGE: body lies here',
					type: 'BREAKING CHANGE:',
				},
			],
		},
	)
})
