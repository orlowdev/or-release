import test from 'ava'
import { any, all } from '../../src/utils/bool'
import * as sinon from 'sinon'

test('any.ifTrue executes provided function if the value is true', (t) => {
	const spy = sinon.spy()
	any(true).ifTrue(spy)
	t.true(spy.calledOnce)
})

test('any.ifTrue ignores provided function if the value is false', (t) => {
	const spy = sinon.spy()
	any(false).ifTrue(spy)
	t.false(spy.called)
})

test('all.ifTrue executes provided function if the value is true', (t) => {
	const spy = sinon.spy()
	all(true).ifTrue(spy)
	t.true(spy.calledOnce)
})

test('all.ifTrue ignores provided function if the value is false', (t) => {
	const spy = sinon.spy()
	all(false).ifTrue(spy)
	t.false(spy.called)
})

test('any.ifFalse executes provided function if the value is true', (t) => {
	const spy = sinon.spy()
	any(false).ifFalse(spy)
	t.true(spy.calledOnce)
})

test('any.ifFalse ignores provided function if the value is false', (t) => {
	const spy = sinon.spy()
	any(true).ifFalse(spy)
	t.false(spy.called)
})

test('all.ifFalse executes provided function if the value is true', (t) => {
	const spy = sinon.spy()
	all(false).ifFalse(spy)
	t.true(spy.calledOnce)
})

test('all.ifFalse ignores provided function if the value is false', (t) => {
	const spy = sinon.spy()
	all(true).ifFalse(spy)
	t.false(spy.called)
})

test('Semigroup - Associativity', (t) => {
	t.true(
		any(true)
			.concat(any(false).concat(any(false)))
			.equals(any(true).concat(any(false).concat(any(false)))),
	)

	t.true(
		all(true)
			.concat(all(false).concat(all(false)))
			.equals(all(true).concat(all(false).concat(all(false)))),
	)
})
