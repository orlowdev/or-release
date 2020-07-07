import test from 'ava'
import { forceBumping } from '../../src/pure/force-bumping'
import * as sinon from 'sinon'

const logInfo = sinon.spy()

test('forceBumping forces bumping X, Y or Z if a X, Y or Z update commit type is found', (t) => {
	t.deepEqual(
		forceBumping({ key: 'bumpMajor', logInfo })({
			bumpMajor: false,
			bumpMinor: false,
			bumpPatch: false,
			commitList: [
				{
					type: 'major',
				} as any,
			],
			conventions: [
				{
					bumps: 'major',
					match: ['^major'],
				} as any,
			],
		}),
		{ bumpMajor: true },
	)
})

test('forceBumping preserves the initial value for bumping X,Y or Z if a X, Y or Z update commit is not found', (t) => {
	t.deepEqual(
		forceBumping({ key: 'bumpMinor', logInfo })({
			bumpMajor: false,
			bumpMinor: true,
			bumpPatch: false,
			commitList: [],
			conventions: [],
		}),
		{ bumpMinor: true },
	)
})

test('forceBumping only logs to console if version changes are found', (t) => {
	t.true(logInfo.calledOnce)
})
