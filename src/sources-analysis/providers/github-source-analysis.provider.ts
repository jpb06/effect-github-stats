import { Octokit } from '@octokit/core';
import { pipe, Config, Effect } from 'effect';

const githubConfig = Config.string('GITHUB_TOKEN');

export const githubSourceAnalysisProvider = pipe(
  githubConfig,
  Effect.flatMap((token) =>
    Effect.succeed(
      new Octokit({
        auth: token,
      }),
    ),
  ),
);
