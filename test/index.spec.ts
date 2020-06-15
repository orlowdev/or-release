import test from 'ava'

test('app mvp', (t) => {
	t.log('print current commit')
	t.log('get latest semver tag')
	t.log('print latest semver tag')
	t.log('get commit associated with the latest semver tag')
	t.log('get commits since the latest semver tag')
	t.log('transform commits string to an array of IRawCommit objects')
	t.log('log the amount of commits found')
	t.log('evaluate commits and define the candidate version')
	t.log('exit 0 if the candidate version is the same as the latest version')
	t.log('log the candidate version')
	t.log('generate default changelog from the commits')
	t.log('publish release to github')
	t.pass()
})
