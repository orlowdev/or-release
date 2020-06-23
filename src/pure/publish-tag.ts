import type { IAppCtx } from '../types/app-ctx'
import type { LogFunction, LogFatalError } from '../utils/logger'
import { Either } from '../utils/either'

interface IPublishTagDeps {
	logSuccess: LogFunction
	httpTransport: {
		post: (
			url: string,
			options: { headers: Record<string, string>; json: Record<string, any> },
		) => Promise<any>
	}
	logFatalError: LogFatalError
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

				logSuccess`Version ${({ g }) => g(newVersion)} successfully released! 🥂`
			} catch (error) {
				logFatalError('Could not publish the release due to the error:')(error)
			}
		})
