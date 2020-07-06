import test from 'ava'
import * as sinon from 'sinon'
import { exitIfInvalidBuildMetadata } from '../../../src/pure/validators/exit-if-invalid-build-metadata'

test('exitIfInvalidBuildMetadata exits if build metadata value is invalid', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidBuildMetadata({ logFatalError: () => spy })({ buildMetadata: '$1' })
	t.true(spy.calledOnce)
})

test('exitIfInvalidBuildMetadata does not exit if build metadata value is valid', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidBuildMetadata({ logFatalError: () => spy })({ buildMetadata: '20200101' })
	t.false(spy.called)
})

test('exitIfInvalidBuildMetadata does not exit if build metadata is not provided', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidBuildMetadata({ logFatalError: () => spy })({ buildMetadata: '' })
	t.false(spy.called)
})
