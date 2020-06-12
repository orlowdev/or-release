# ||l Template Repository

This is a template repository I created for my projects. You can freely use it if you find it conventient. PRs welcome!

## Why

I hate the monotony. I am so tired of repetitive steps of setting up new repositories. All those copy-pastes of `.github/`, `tsconfig.json` and the others, **ESLint** config and `package.json` updates, and all the other mundane stuff literally drive me crazy. 😡

To help myself, I decided to create this repository. It is intended to be used for **Node** projects with **TypeScript** but I hope it can be extended for other purposes as well. PRs and ideas are welcome!

## Features

- ❌ all things that need to be ignored are ignored
- 👍 set up for **TypeScript**
- ❌ no semicolons (they will be added upon transpilation anyway, why bother?)
- 🚀 testing with **AVA** (coverage with `yarn test:cover` included)
- ✅ coverage is set up to be at least 80%
- ⛓ linting with **XO**
- 😱 linting commits with **commitlint** set up for [gitmoji](https://gitmoji.carloscuesta.me)
- ⚙️ git hooks for formatting staged files + linting commit messages (on `commit message`) and linting + coverage testing (on `pre-push`)
- 👔 formatting with **XO** and **Prettier**
- 🛠 no config files (all configuration in `package.json`)
- 📝 Basic docs provided (MIT license, Code of Conduct, Contributing, Getting Started, Codeowners, Funding, PR template, Bug and Feature issue templates, Security)
- 📈 Workflows for GitHub Actions set up for linting and test coverage

## TBD

Things below are the things I need myself. If you think something else can be provided, let me know by creating a feature request issue.

- Versioning
- Publishing to NPM and GitHub Packages
- Denoability
- Gatsby compatibility oriented for Netlify
- Automated way to change project name, description (and, hopefully, author)
