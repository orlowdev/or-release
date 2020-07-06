import test from 'ava'
import * as sinon from 'sinon'
import { exitIfInvalidPreRelease } from '../../../src/pure/validators/exit-if-invalid-pre-release'

test('exitIfInvalidPreRelease exits if pre-release value is invalid', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidPreRelease({ logFatalError: () => spy })({ preRelease: '001' })
	t.true(spy.calledOnce)
})

test('exitIfInvalidPreRelease does not exit if pre-release value is valid', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidPreRelease({ logFatalError: () => spy })({ preRelease: 'alpha' })
	t.false(spy.called)
})

test('exitIfInvalidPreRelease does not exit if pre-release is not provided', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidPreRelease({ logFatalError: () => spy })({ preRelease: '' })
	t.false(spy.called)
})
