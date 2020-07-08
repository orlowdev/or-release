import test from 'ava'
import { getConfigFromFile } from '../../../src/pure/getters/get-config-from-file'
import { Either } from '../../../src/utils/either'

test('getConfigFromFile returns empty object if reading the file fails', (t) => {
	const readFileEither: any = () => Either.left(new Error('test'))

	t.deepEqual(getConfigFromFile({ readFileEither })({ key: 'value' } as any), {})
})

test('getConfigFromFile returns merged initial context and the config read from the JSON file', (t) => {
	const readFileEither: any = () => Either.right('{"public": true}')

	t.deepEqual(
		getConfigFromFile({ readFileEither })({
			public: false,
			dryRun: true,
			configFile: 'test.json',
		} as any),
		{
			configFile: 'test.json',
			public: true,
			dryRun: true,
		},
	)
})

test('getConfigFromFile returns merged initial context and the config read from the YAML file', (t) => {
	const readFileEither: any = () => Either.right('public: true')

	t.deepEqual(
		getConfigFromFile({ readFileEither })({
			public: false,
			dryRun: true,
			configFile: 'test.yml',
		} as any),
		{
			configFile: 'test.yml',
			public: true,
			dryRun: true,
		},
	)

	t.deepEqual(
		getConfigFromFile({ readFileEither })({
			public: false,
			dryRun: true,
			configFile: 'test.yaml',
		} as any),
		{
			configFile: 'test.yaml',
			public: true,
			dryRun: true,
		},
	)
})

test('getConfigFromFile returns merged initial context and the config read from the TOML file', (t) => {
	const readFileEither: any = () => Either.right('public = true')

	t.deepEqual(
		getConfigFromFile({ readFileEither })({
			public: false,
			dryRun: true,
			configFile: 'test.toml',
		} as any),
		{
			configFile: 'test.toml',
			public: true,
			dryRun: true,
		},
	)
})

test('getConfigFromFile returns initial context if provided config file is not supported', (t) => {
	const readFileEither: any = () => Either.right('public = true')

	t.deepEqual(
		getConfigFromFile({ readFileEither })({
			public: false,
			dryRun: true,
			configFile: 'test.dunno',
		} as any),
		{
			public: false,
			dryRun: true,
			configFile: 'test.dunno',
		},
	)
})

test('getConfigFromFile ignores properties that are not present in the initial context', (t) => {
	const readFileEither: any = () => Either.right('{"public": true, "irrelevant": true}')

	t.deepEqual(
		getConfigFromFile({ readFileEither })({
			public: false,
			dryRun: true,
			configFile: 'test.json',
		} as any),
		{
			configFile: 'test.json',
			public: true,
			dryRun: true,
		},
	)
})
