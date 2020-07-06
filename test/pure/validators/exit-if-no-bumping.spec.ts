import test from 'ava'
import * as sinon from 'sinon'
import { exitIfNoBumping } from '../../../src/pure/validators/exit-if-no-bumping'

test('exitIfNoBumping exits if no version bumping is required', (t) => {
	const logExitingWarning: any = sinon.spy()
	exitIfNoBumping({ logExitingWarning })({ bumpPatch: false, bumpMinor: false, bumpMajor: false })
	t.true(logExitingWarning.calledOnce)
})

test('exitIfNoBumping does not exit if version bumping is required', (t) => {
	const logExitingWarning: any = sinon.spy()
	exitIfNoBumping({ logExitingWarning })({ bumpPatch: false, bumpMinor: true, bumpMajor: false })
	t.false(logExitingWarning.called)
})
