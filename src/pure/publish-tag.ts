import type { Got } from 'got'
import type { IAppCtx } from '../types/app-ctx'
import type { ILogFunction, Unary } from '../types/common-types'
import { Either } from '../utils/either'

interface IPublishTagDeps {
	logSuccess: ILogFunction
	httpTransport: Got
	logFatalError: Unary<string, Unary<Error, never>>
}

type PublishTagCtx = Pick<IAppCtx, 'token' | 'changelog' | 'newVersion' | 'repository' | 'dryRun'>

export const publishTag = ({ logSuccess, httpTransport, logFatalError }: IPublishTagDeps) => ({
	token,
	changelog,
	newVersion,
	repository,
}: PublishTagCtx) =>
	Either.right('https://api.github.com/repos/')
		.map((origin) => origin.concat(repository))
		.map((origin) => origin.concat('/releases'))
		.map(async (url) => {
			try {
				await httpTransport.post(url, {
					headers: {
						Authorization: `Bearer ${token}`,
						'Content-Type': 'application/json',
					},
					json: { tag_name: newVersion, name: newVersion, body: changelog },
				})

				logSuccess`Version ${({ green }) => green(newVersion)} successfully released! 🥂`
			} catch (error) {
				logFatalError('Could not publish the release due to the error:')(error)
			}
		})
