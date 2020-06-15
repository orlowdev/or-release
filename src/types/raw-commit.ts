export interface IRawCommit {
	hash: string
	abbrevHash: string
	author: {
		name: string
		email: string
	}
	type: string
	description: string
	body: string
}
