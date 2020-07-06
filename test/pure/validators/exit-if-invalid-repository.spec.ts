import test from 'ava'
import * as sinon from 'sinon'
import { exitIfInvalidRepository } from '../../../src/pure/validators/exit-if-invalid-repository'

test('exitIfInvalidRepository exits if provided repository is invalid', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidRepository({ logFatalError: () => spy })({ repository: 'asdf' })
	t.true(spy.calledOnce)
})

test('exitIfInvalidRepository exits if repository is not provided', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidRepository({ logFatalError: () => spy })({ repository: '' })
	t.true(spy.calledOnce)
})

test('exitIfInvalidRepository does not exit if provided repository is valid', (t) => {
	const spy: any = sinon.spy()
	exitIfInvalidRepository({ logFatalError: () => spy })({ repository: 'priestine/versions' })
	t.false(spy.called)
})
