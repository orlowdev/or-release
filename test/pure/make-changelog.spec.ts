import test from 'ava'
import { makeChangelog } from '../../src/pure/make-changelog'

test('makeChangelog properly creates a changelog', (t) => {
	t.deepEqual(
		makeChangelog({
			newVersion: '1.0.0',
			commitList: [
				{
					hash: '',
					abbrevHash: '1231231',
					type: 'major',
					description: 'My commit',
					body: 'Closes #4',
					author: {
						name: 'author',
						email: 'email',
					},
				},
				{
					hash: '',
					abbrevHash: '1231232',
					type: 'minor',
					description: 'My second commit',
					body: 'Some body to validate if it really works, Fix #3',
					author: {
						name: 'author',
						email: 'email',
					},
				},
				{
					hash: '',
					abbrevHash: '1231233',
					type: 'patch',
					description: 'My third commit',
					body: 'Close #2',
					author: {
						name: 'author',
						email: 'email',
					},
				},
				{
					hash: '',
					abbrevHash: '1231234',
					type: 'patch',
					description: 'Last 1',
					body: 'Closes #4',
					author: {
						name: 'anotherauthor',
						email: 'email@example.com',
					},
				},
				{
					hash: '',
					abbrevHash: '1231235',
					type: 'ignored',
					description: 'Last 0',
					body: 'Closes #4',
					author: {
						name: 'anotherauthor',
						email: 'email@example.com',
					},
				},
			],
			conventions: [
				{
					match: ['^major'],
					bumps: 'major',
					groupTitleFormat: '\n\nTest Major\n',
					itemDescriptionFormat:
						'* %commit.description% (%commit.abbrevHash%) - %commit.author.name% <%commit.author.email%>',
					itemBodyFormat: '> %commit.body%',
				},
				{
					match: ['^this convention has no matching commits'],
					bumps: 'major',
					groupTitleFormat: '\n\nThis convention has no matching commits\n',
					itemDescriptionFormat:
						'* %commit.description% (%commit.abbrevHash%) - %commit.author.name% <%commit.author.email%>',
					itemBodyFormat: '> %commit.body%',
				},
				{
					match: ['^minor'],
					bumps: 'minor',
					groupTitleFormat: '\n\nTest Minor\n',
					groupDescription: 'Test group description.\n',
					itemDescriptionFormat:
						'* %commit.description% (%commit.abbrevHash%) - %commit.author.name% <%commit.author.email%>',
					itemBodyFormat: '> %commit.body%',
				},
				{
					match: ['^patch'],
					bumps: 'patch',
					groupTitleFormat: '\n\nTest Patch\n',
					itemDescriptionFormat:
						'* %commit.description% (%commit.abbrevHash%) - %commit.author.name% <%commit.author.email%>',
					itemBodyFormat: '> %commit.body%',
				},
			],
		}),
		{
			changelog: `# 1.0.0

Test Major

* My commit (1231231) - author <email>

Test Minor

Test group description.

* My second commit (1231232) - author <email>

> Some body to validate if it really works

Test Patch

* My third commit (1231233) - author <email>
* Last 1 (1231234) - anotherauthor <email@example.com>

`,
		},
	)
})

test('makeChangelog omits changelog sections that have no corresponding commits', (t) => {
	t.deepEqual(
		makeChangelog({
			newVersion: '1.0.0',
			commitList: [
				{
					hash: '',
					abbrevHash: '1231231',
					type: 'major',
					description: 'My commit',
					body: 'Closes #4',
					author: {
						name: 'author',
						email: 'email',
					},
				},
				{
					hash: '',
					abbrevHash: '1231233',
					type: 'patch',
					description: 'My third commit',
					body: 'Close #2',
					author: {
						name: 'author',
						email: 'email',
					},
				},
				{
					hash: '',
					abbrevHash: '1231234',
					type: 'patch',
					description: 'Last 1',
					body: 'Closes #4',
					author: {
						name: 'anotherauthor',
						email: 'email@example.com',
					},
				},
				{
					hash: '',
					abbrevHash: '1231235',
					type: 'ignored',
					description: 'Last 0',
					body: 'Closes #4',
					author: {
						name: 'anotherauthor',
						email: 'email@example.com',
					},
				},
			],
			conventions: [
				{
					match: ['^major'],
					bumps: 'major',
					groupTitleFormat: '\n\nTest Major\n',
					itemDescriptionFormat:
						'* %commit.description% (%commit.abbrevHash%) - %commit.author.name% <%commit.author.email%>',
					itemBodyFormat: '> %commit.body%',
				},
				{
					match: ['^this convention has no matching commits'],
					bumps: 'major',
					groupTitleFormat: '\n\nThis convention has no matching commits\n',
					itemDescriptionFormat:
						'* %commit.description% (%commit.abbrevHash%) - %commit.author.name% <%commit.author.email%>',
					itemBodyFormat: '> %commit.body%',
				},
				{
					match: ['^minor'],
					bumps: 'minor',
					groupTitleFormat: '\n\nTest Minor\n',
					groupDescription: 'Test group description.\n',
					itemDescriptionFormat:
						'* %commit.description% (%commit.abbrevHash%) - %commit.author.name% <%commit.author.email%>',
					itemBodyFormat: '> %commit.body%',
				},
				{
					match: ['^patch'],
					bumps: 'patch',
					groupTitleFormat: '\n\nTest Patch\n',
					itemDescriptionFormat:
						'* %commit.description% (%commit.abbrevHash%) - %commit.author.name% <%commit.author.email%>',
					itemBodyFormat: '> %commit.body%',
				},
			],
		}),
		{
			changelog: `# 1.0.0

Test Major

* My commit (1231231) - author <email>

Test Patch

* My third commit (1231233) - author <email>
* Last 1 (1231234) - anotherauthor <email@example.com>

`,
		},
	)
})
