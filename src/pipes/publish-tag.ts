import type { Got } from 'got'
import type { IAppCtx } from '../types/app-ctx'
import type { Unary } from '../types/common-types'
import type { IColorizer, ILogger } from '../utils/logger'
import { Either } from '../utils/either'
import { errorToString } from '../utils/helpers'
import { any } from '../utils/any'

interface IPublishTagDeps {
	logger: ILogger
	httpTransport: Got
	processExit: Unary<number, never>
	colors: IColorizer
}

type PublishTagCtx = Pick<IAppCtx, 'token' | 'changelog' | 'newVersion' | 'repository' | 'dryRun'>

export const publishTag = ({ logger, httpTransport, processExit, colors }: IPublishTagDeps) => ({
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
						logger.error('Could not publish the release due to the error:')
						logger.error(errorToString(error))
						processExit(1)
					}
				}),
		)
