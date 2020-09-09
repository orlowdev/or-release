import test from 'ava'
import * as sinon from 'sinon'
import { publishTag } from '../../src/pure/publish-tag'

test('publishTag exits with fatal error if publishing a tag fails', async (t) => {
	const httpTransport = {
		post: () => {
			throw new Error('test')
		},
	}

	const spy: any = sinon.spy()

	await publishTag({
		httpTransport,
		logFatalError: () => spy,
		logSuccess: () => undefined,
		logInfo: () => undefined,
	})({
		token: '',
		changelog: '',
		newVersion: '',
		repository: '',
		customUrl: '',
		currentCommit: '',
		preRelease: '',
	})

	t.true(spy.calledOnce)
})

test('publishTag publishes tag using correct request to a custom origin', async (t) => {
	const post = sinon.spy()
	const spy: any = sinon.spy()

	const httpTransport = {
		post,
	}

	await publishTag({
		httpTransport,
		logFatalError: () => spy,
		logSuccess: () => undefined,
		logInfo: () => undefined,
	})({
		token: 'token',
		changelog: 'changelog',
		newVersion: '1.0.0',
		repository: 'orlovedev/or-release',
		customUrl: 'https://example.com/',
		currentCommit: '123123123123123123123123123123123123123123',
		preRelease: 'alpha',
	})

	t.true(
		post.calledWithExactly('https://example.com/orlovedev/or-release/releases', {
			headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
			json: {
				tag_name: '1.0.0',
				name: '1.0.0',
				body: 'changelog',
				target_commitish: '123123123123123123123123123123123123123123',
				prerelease: true,
			},
		}),
	)
})

test('publishTag publishes tag using correct request to GitHub', async (t) => {
	const post = sinon.spy()
	const spy: any = sinon.spy()

	const httpTransport = {
		post,
	}

	await publishTag({
		httpTransport,
		logFatalError: () => spy,
		logSuccess: () => undefined,
		logInfo: () => undefined,
	})({
		token: 'token',
		changelog: 'changelog',
		newVersion: '1.0.0',
		repository: 'orlovedev/or-release',
		customUrl: '',
		currentCommit: '123123123123123123123123123123123123123123',
		preRelease: '',
	})

	t.true(
		post.calledWithExactly('https://api.github.com/repos/orlovedev/or-release/releases', {
			headers: { Authorization: 'Bearer token', 'Content-Type': 'application/json' },
			json: {
				tag_name: '1.0.0',
				name: '1.0.0',
				body: 'changelog',
				target_commitish: '123123123123123123123123123123123123123123',
				prerelease: false,
			},
		}),
	)
})
