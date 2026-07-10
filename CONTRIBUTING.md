# Contributing to SvelteKit OG

First off, thank you for considering contributing to SvelteKit OG! It's people like you that make the open source community such a great place.

## Where do I start?

### Reporting Bugs

If you find a bug, please open an issue on our [GitHub repository](https://github.com/ethercorps/sveltekit-og/issues). Please include as much information as possible, including:

- A clear and descriptive title.
- A detailed description of the bug, including steps to reproduce it.
- The version of SvelteKit OG you are using.
- Any relevant code snippets.

### Suggesting Enhancements

If you have an idea for a new feature or an improvement to an existing one, please open an issue on our [GitHub repository](https://github.com/ethercorps/sveltekit-og/issues). Please include:

- A clear and descriptive title.
- A detailed description of the enhancement you are suggesting.
- Any relevant code snippets or mockups.

### Submitting Pull Requests

If you would like to contribute code to the project, please follow these steps:

1. Fork the repository and create a `new branch` from `dev`.
2. Make your changes and commit them with a clear and descriptive commit message.
3. Push your changes to your fork.
4. Open a pull request to the `dev` branch of the SvelteKit OG repository. (`main` is the release branch — see [Releasing](#releasing).)

Please make sure your pull request includes:

- A clear and descriptive title.
- A detailed description of the changes you have made.
- A reference to any related issues.

## Styleguides

### Git Commit Messages

- Use feat, fix, docs, style, refactor, perf, test, chore as type prefixes.
- Separate type and subject with a colon and a space.
- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 72 characters or fewer.

### Code Style

This project uses [Prettier](https://prettier.io/) and [ESLint](https://eslint.org/) to enforce a consistent code style. Please make sure your code is formatted correctly before submitting a pull request. You can use the following commands to check and format your code:

```bash
npm run lint
npm run format
```

## Releasing

> For maintainers. Releases are automated by `.github/workflows/release.yml` and published to npm via **Trusted Publishing (OIDC)** — there is no `NPM_TOKEN` stored in the repo.

**The version string in `packages/sveltekit-og/package.json` decides the npm dist-tag; the branch decides whether that release is allowed:**

| Branch | Version           | Published to     |
| ------ | ----------------- | ---------------- |
| `main` | clean (`4.4.0`)   | `latest` (prod)  |
| `dev`  | `-beta.x`         | `beta`           |
| any    | `-next.x`         | `next`           |

Any other branch/version combination does **not** publish. A push/merge only publishes when the version is not already on npm — merges that don't bump the version are no-ops.

Bump the version with the interactive helper (it commits and pushes to the current branch; the CI creates the git tag):

```bash
pnpm release
```

### Beta

```bash
git checkout dev
pnpm release          # pick a -beta version, e.g. 4.4.0-beta.0
```

Pushing to `dev` publishes `@beta`. Install with `npm i @ethercorps/sveltekit-og@beta`.

### Next (experimental preview)

```bash
pnpm release          # pick a -next version, e.g. 4.4.0-next.0
```

Publishes `@next` from any branch. Use for throwaway previews you don't want on `@beta`.

### Production

Bump to a clean version on `dev` (this is a no-op publish), then merge `dev` → `main`:

```bash
git checkout dev
pnpm release                # pick the clean release, e.g. 4.4.0
git push origin dev

git checkout main
git merge --ff-only dev     # or merge the dev → main PR
git push origin main
```

Pushing the clean version to `main` publishes `@latest`.

> Do **not** bump the clean version directly on `main` during a beta cycle — bump on `dev` and merge, so `main` always matches what's on `@latest`.

### Hotfix

```bash
git checkout -b hotfix main
# fix, then:
pnpm release                # e.g. 4.4.1
git checkout main && git merge --ff-only hotfix && git push origin main
git checkout dev  && git merge main && git push origin dev   # keep dev in sync
```

### One-time setup

Trusted Publishing must be configured once on npmjs.com → the package → **Settings → Trusted Publishing**: add a GitHub Actions publisher for repo `ethercorps/sveltekit-og`, workflow `release.yml`. Without it, publishing fails (by design — npm only trusts that exact repo + workflow).

## Code of Conduct

This project and everyone participating in it is governed by the [SvelteKit OG Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [ethercorps@gmail.com](mailto:ethercorps@gmail.com).
