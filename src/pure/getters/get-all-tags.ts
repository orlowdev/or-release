import type { Unary } from '../../types/common-types'
import type { IEither } from '../../utils/either'

interface IDeps {
	execEither: Unary<string, IEither<string, Error>>
}

export const getAllTags = ({ execEither }: IDeps) => () => ({
	allTags: execEither('git show-ref --tags')
		.map((string) => string.split('\n'))
		.map((refs) => refs.map((ref) => ref.replace(/.*refs\/tags\//, '')))
		.map((tags) => tags.filter((tag) => !/(\d+)\.?(\d+)?\.?(\d+)?\+(.*)/.test(tag)))
		.map((tags) => tags.sort(bySemVer))
		.fold(
			() => [],
			(tags) => tags,
		),
})

// ------------------------------------------------------------------------------------------------

const bySemVer = (a: string, b: string): -1 | 0 | 1 => {
	const aTuple: [number, number, number, string] = (/(\d+)\.?(\d+)?\.?(\d+)?(.*)/.exec(a) as any)
		.slice(1, 5)
		.map((n: string, i: number) => (i < 3 ? Number(n) : n))

	const bTuple: [number, number, number, string] = (/(\d+)\.?(\d+)?\.?(\d+)?(.*)/.exec(b) as any)
		.slice(1, 5)
		.map((n: string, i: number) => (i < 3 ? Number(n) : n))

	if (aTuple[0] > bTuple[0]) {
		return -1
	}

	if (aTuple[0] < bTuple[0]) {
		return 1
	}

	if (aTuple[1] > bTuple[1]) {
		return -1
	}

	if (aTuple[1] < bTuple[1]) {
		return 1
	}

	if (aTuple[2] > bTuple[2]) {
		return -1
	}

	if (aTuple[2] < bTuple[2]) {
		return 1
	}

	const [aRc, aRcVersion] = aTuple[3].split('.')
	const [bRc, bRcVersion] = bTuple[3].split('.')

	if (!aRc) {
		return -1
	}

	if (!bRc) {
		return 1
	}

	if (aRc > bRc) {
		return 1
	}

	if (aRc < bRc) {
		return -1
	}

	if (Number(aRcVersion) < Number(bRcVersion)) {
		return 1
	}

	return -1
}
