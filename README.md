# effect-github-stats

[![Open in Visual Studio Code](https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc)](https://github.dev/jpb06/effect-github-stats)
![npm bundle size](https://img.shields.io/bundlephobia/min/effect-github-stats)
![Github workflow](https://img.shields.io/github/actions/workflow/status/jpb06/effect-github-stats/ci.yml?branch=main&logo=github-actions&label=last%20workflow)
![Last commit](https://img.shields.io/github/last-commit/jpb06/effect-github-stats?logo=git)

An [Effect](https://effect.website/) layer to interact with github api.

# 😺 This codebase has moved to [effect-octokit-layer](https://github.com/jpb06/effect-octokit-layer)

<!-- readme-package-icons start -->

<p align="left"><a href="https://docs.github.com/en/actions" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/GithubActions-Dark.svg" /></a>&nbsp;<a href="https://www.typescriptlang.org/docs/" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/TypeScript.svg" /></a>&nbsp;<a href="https://nodejs.org/en/docs/" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/NodeJS-Dark.svg" /></a>&nbsp;<a href="https://bun.sh/docs" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Bun-Dark.svg" /></a>&nbsp;<a href="https://biomejs.dev/guides/getting-started/" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Biome-Dark.svg" /></a>&nbsp;<a href="https://github.com/motdotla/dotenv#readme" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Dotenv-Dark.svg" /></a>&nbsp;<a href="https://vitest.dev/guide/" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Vitest-Dark.svg" /></a>&nbsp;<a href="https://www.effect.website/docs/quickstart" target="_blank"><img height="50" src="https://raw.githubusercontent.com/jpb06/jpb06/master/icons/Effect-Dark.svg" /></a></p>

<!-- readme-package-icons end -->

## ⚡ Access to github api

You first need to [create a github token](https://github.com/settings/tokens) with a scope related to your needs.

```bash
GITHUB_TOKEN="my-github-token"
```

## ⚡ Layer Api

### 🔶 Users

```typescript
import { OctokitLayer, OctokitLayerLive } from 'effect-github-stats';

const username = 'jpb06';

const [profile, repos, orgs, events] = await Effect.runPromise(
  pipe(
    Effect.all(
      [
        // Get user profile
        OctokitLayer.user(username).profile(),
        // Get user repos
        OctokitLayer.user(username).repos(),
        // Get user organizations
        OctokitLayer.user(username).orgs(),
        // Get user events
        OctokitLayer.user(username).events(),
      ],
      // Fetch all these in parallel
      { concurrency: 'unbounded' }
    ),
    Effect.provide(OctokitLayerLive)
  )
);
```

### 🔶 Organizations

```typescript
import { OctokitLayer, OctokitLayerLive } from 'effect-github-stats';

const orgs = await Effect.runPromise(
  pipe(
    // Get organization repos
    OctokitLayer.org('my-org').repos(),
    Effect.provide(OctokitLayerLive)
  )
);
```

### 🔶 Repositories

```typescript
import { RepoArgs, OctokitLayer, OctokitLayerLive } from 'effect-github-stats';

const reactRepo: RepoArgs = {
  owner: 'facebook',
  name: 'react',
};

const [issues, pulls, issue34, pull5453, pull5453Reviews] =
  await Effect.runPromise(
    pipe(
      Effect.all(
        [
          // Get all issues
          OctokitLayer.repo(reactRepo).issues(),
          // Get all pull requests
          OctokitLayer.repo(reactRepo).pulls(),
          // Get issue #34
          OctokitLayer.repo(reactRepo).issue(34),
          // Get pull request #5453 data
          OctokitLayer.repo(reactRepo).pull(5453).details(),
          // Get pull request #5453 reviews
          OctokitLayer.repo(reactRepo).pull(5453).reviews(),
        ],
        // Fetch all these in parallel
        { concurrency: 'unbounded' }
      ),
      Effect.provide(OctokitLayerLive)
    )
  );
```

### 🔶 Parallelism and resilience

#### 🧿 Concurrency

> Default: `10`

You can specify the `concurrency` parameter on calls doing several requests in parallel (paginated data). For example:

```typescript
// Will fetch the first page and then 100 pages concurrently
OctokitLayer.repo({
  owner: 'facebook',
  name: 'react',
}).pulls(100);
```

Note that github api enforces [api rate limits](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api?apiVersion=2022-11-28#dealing-with-secondary-rate-limits). Fetching too many results concurrently will cause an api rate limit. In that case, a warning will be displayed and the call will be attempted again after the time window provided by github api (typically 60 seconds).
