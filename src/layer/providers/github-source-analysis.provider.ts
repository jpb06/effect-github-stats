import { Octokit } from '@octokit/core';
import { pipe, Config, Effect } from 'effect';

import { GithubApiError } from '../errors/github-api.error';

const githubConfig = Config.withDefault(
  Config.string('GITHUB_TOKEN'),
  'github-token-not-set',
);

export const githubSourceAnalysisProvider = pipe(
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
