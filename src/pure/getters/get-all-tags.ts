import type { Unary } from '../../types/common-types'
import type { IEither } from '../../utils/either'

interface IGetAllTagsDeps {
	execEither: Unary<string, IEither<string, Error>>
}

export const getAllTags = ({ execEither }: IGetAllTagsDeps) => () => ({
	allTags: execEither('git show-ref --tags')
		.map((string) => string.split('\n'))
		.map((refs) => refs.map((ref) => ref.replace(/.*refs\/tags\//, '')))
		.map((tags) => tags.reverse())
		.fold(
			() => [],
			(tags) => tags,
		),
})
