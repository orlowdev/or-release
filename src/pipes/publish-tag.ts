import type { Got } from 'got'
import type { IAppCtx } from '../types/app-ctx'
import type { IColorizer, ILogger, Unary } from '../types/common-types'
import { any } from '../utils/any'
import { Either } from '../utils/either'

interface IPublishTagDeps {
	logger: ILogger
	httpTransport: Got
	logFatalError: Unary<string, Unary<Error, never>>
	colors: IColorizer
}

type PublishTagCtx = Pick<IAppCtx, 'token' | 'changelog' | 'newVersion' | 'repository' | 'dryRun'>

export const publishTag = ({ logger, httpTransport, logFatalError, colors }: IPublishTagDeps) => ({
	token,
	changelog,
	newVersion,
	dryRun,
	repository,
}: PublishTagCtx) =>
	any(dryRun)
		.ifTrue(() => logger.warning('Dry run mode. New version will not be published. Terminating.'))
		.ifFalse(() =>
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

						logger.success(`Version ${colors.green(newVersion)} successfully released! 🥂`)
					} catch (error) {
						logFatalError('Could not publish the release due to the error:')(error)
					}
				}),
		)
