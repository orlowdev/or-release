import test from 'ava'
import { getAllTags } from '../../../src/pure/getters/get-all-tags'
import { Either } from '../../../src/utils/either'

const refs = `b780e47a1b4bcc889410ee2ba45ccac99ef2be70 refs/tags/0.1.0
80267b73042a4430d228ac52655c668f20e1ce28 refs/tags/1.0.0
9cc7016ba374da25eab2d8acb6cf450cc46cece0 refs/tags/1.1.0
7d45f25bb8f51b0ea0ba6c92de598c90018d7a22 refs/tags/1.10.0
d6dff8d5900ae45b1d1c7644f59210bb1cf397af refs/tags/1.10.0-preview.1
0cd8a1ba3ad1cc6c57586a7359b05a1ba56d7894 refs/tags/1.10.1
cb0765b2ab4cfab9efdfe1e5dec51c67a72a991b refs/tags/1.11.0
73da0113cbf7a7aa2075121d69ac99a3a3232014 refs/tags/1.12.0
d8e50e9bfa99470bf9923c841a28d2b57d3831b8 refs/tags/1.12.0-alpha.1
486a68364885bee7ab4aababb85bd8d77ccaa813 refs/tags/1.12.0-alpha.2
e20bc7e472a78b35c14387ee619c6d8d9f8cdcdb refs/tags/1.13.0-alpha.2
1e8defa74a7275a8d6e18379758faccb88c6e032 refs/tags/1.13.0-alpha.1
b738a245449e277f01e1a327a9b00978bc83fe81 refs/tags/1.13.0+abcdef
b738a245449e277f01e1a327a9b00978bc83fe81 refs/tags/1.13.0
b738a245449e277f01e1a327a9b00978bc83fe81 refs/tags/1.13.0+20200101
9c819b7e2bf176e784277b6c751d0e2d8cfb784a refs/tags/1.13.0-beta.1
7737dff7788376d094adeafc0b70bdf57dc7be3d refs/tags/1.13.0-alpha.3
9c819b7e2bf176e784277b6c751d0e2d8cfb784a refs/tags/1.13.0-beta.2
9c819b7e2bf176e784277b6c751d0e2d8cfb784a refs/tags/1.13.0-alpha.4
d1f609dfab980b187806fc8f1c088809d2983d87 refs/tags/1.2.0
cec220ad4e494221c7194a565461228d3ec2fc05 refs/tags/1.3.0
b66c4b5c8e33e210381e735183bddedd20130f76 refs/tags/1.4.0
f673f6ba84144f8cfcff71a5eecfa2ad253dd7e1 refs/tags/1.5.0
2fdcc7f9339ad916d43d1af9ec9fe7fba69e7857 refs/tags/1.6.0
cf779a12f327350339065748b58e4235249a43b5 refs/tags/1.7.1
81380b15772361f2f27549108a3b960f7523f2d4 refs/tags/1.7.0
4a0d8db5b64054d4ee842ea13fb9c5a45d103998 refs/tags/1.7.2
1cc971eee21a917256ef3224c0f80f43600911d4 refs/tags/1.8.0
e5a0cf9eba6fc00e43b56e4e3ec5dea0b757f91d refs/tags/1.8.1
a433dab20d202584f3b209dbc6d870f986ef0922 refs/tags/1.9.0
a433dab20d202584f3b209dbc6d870f986ef0922 refs/tags/2.0.0
a433dab20d202584f3b209dbc6d870f986ef0922 refs/tags/0.4.0
c73d90ac5464fe25dda5a48fae261e564cb7f263 refs/tags/v1.9.0-rc.1`

test('getAllTags should return an empty array if execEither fails', (t) => {
	t.deepEqual(
		getAllTags({
			execEither: () => Either.left(new Error('test')),
		})(),
		{ allTags: [] },
	)
})

test('getAllTags should call execEither to get tags, normalize and sort them', (t) => {
	t.deepEqual(getAllTags({ execEither: () => Either.of(refs) })(), {
		allTags: [
			'2.0.0',
			'1.13.0',
			'1.13.0-alpha.4',
			'1.13.0-alpha.3',
			'1.13.0-alpha.2',
			'1.13.0-alpha.1',
			'1.13.0-beta.2',
			'1.13.0-beta.1',
			'1.12.0',
			'1.12.0-alpha.2',
			'1.12.0-alpha.1',
			'1.11.0',
			'1.10.1',
			'1.10.0',
			'1.10.0-preview.1',
			'1.9.0',
			'v1.9.0-rc.1',
			'1.8.1',
			'1.8.0',
			'1.7.2',
			'1.7.1',
			'1.7.0',
			'1.6.0',
			'1.5.0',
			'1.4.0',
			'1.3.0',
			'1.2.0',
			'1.1.0',
			'1.0.0',
			'0.4.0',
			'0.1.0',
		],
	})
})
