import test from 'ava'
import * as sinon from 'sinon'
import { exitIfDryRun } from '../../../src/pure/validators/exit-if-dry-run'

test('exitIfDryRun exits if dry run', (t) => {
	const logExitingWarning: any = sinon.spy()
	exitIfDryRun({ logExitingWarning })({ dryRun: true })
	t.true(logExitingWarning.calledOnce)
})

test('exitIfDryRun does not exit if not dry run', (t) => {
	const logExitingWarning: any = sinon.spy()
	exitIfDryRun({ logExitingWarning })({ dryRun: false })
	t.false(logExitingWarning.called)
})
