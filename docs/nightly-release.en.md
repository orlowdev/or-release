# Releasing nightly builds

[English](./nightly-release.en.md) ∘ [Русский](./nightly-release.ru.md)

This document briefly describes the automation of the process of publishing nightly releases. For details, see the examples below.

- A CI job is needed to be created, that will be run on publising a new release/tag
- Node must be installed to allow `npx`

## GitHub Actions

```yml
# ./.github/workflows/nightly-release-workflow.yml
name: Nightly Release
on:
 # Set up the schedule for running the job.
 schedule:
  # This job will run daily at 1am.
  # @see https://crontab.guru
  - cron: '0 1 * * *'
jobs:
 versioning:
  runs-on: ubuntu-latest
  steps:
   # Use checkout action to get the code.
   - uses: actions/checkout@v2
     with:
      # Full depth is important because by default checkout action only
      # fetches one commit.
      fetch-depth: 0
   # Install Node to make `npx` available.
   - name: Setup Node
     uses: actions/setup-node@v1
     with:
      node-version: '12.x'
   - name: Publish new version with build metadata attached
     # Run or-release with the build metadata value of current
     # date year, month and day and pre-release of nightly.
     # The result of this command for version 1.0.0 as of June 23, 2020
     # would be `1.0.0-nightly.1+20200623`.
     run: npx or-release --pre-release=nightly --build-metadata=$(date '+%Y%m%d') --repository=$GITHUB_REPOSITORY
     env:
      # Move configuration to environment variables available to
      # or-release.
      OR_RELEASE_TOKEN: ${{ secrets.OR_RELEASE_TOKEN }}
```
