import { Got } from 'got'
import { ILogger, IColorizer } from '../utils/logger'
import { Unary } from '../types/common-types'
import { IEither } from '../utils/either'
import { IAppCtx } from '../types/app-ctx'
import { errorToString } from '../utils/helpers'

interface IPublishTagDeps {
	logger: ILogger
	execEither: Unary<string, IEither<string, Error>>
	httpTransport: Got
	processExit: Unary<number, never>
	colors: IColorizer
}

type PublishTagCtx = Pick<IAppCtx, 'token' | 'changelog' | 'newVersion'>

export const publishTag = ({
	execEither,
	logger,
	httpTransport,
	processExit,
	colors,
}: IPublishTagDeps) => ({ token, changelog, newVersion }: PublishTagCtx) =>
	execEither('git remote get-url origin')
		.map((origin) => origin.replace('.git', '/releases'))
		.map((origin) => origin.replace('https://github.com/', 'https://api.github.com/repos/'))
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
		})
