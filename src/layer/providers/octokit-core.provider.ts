import { Octokit } from '@octokit/core';
import { pipe, Config, Effect } from 'effect';

import { GithubApiError } from '../errors/github-api.error';

const githubConfig = Config.string('GITHUB_TOKEN');

export const octokitCoreProvider = pipe(
  githubConfig,
  Effect.flatMap((token) =>
    pipe(
      Effect.try({
        try: () =>
          new Octokit({
            auth: token,
          }),
        catch: (e) => new GithubApiError({ cause: e }),
      }),
    ),
  ),
);
