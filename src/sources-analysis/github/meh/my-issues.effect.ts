import { GithubApiError } from '@errors';
import { pipe, Effect } from 'effect';

import { githubSourceAnalysisProvider } from '../../providers/github-source-analysis.provider';

export const myIssues = pipe(
  githubSourceAnalysisProvider,
  Effect.flatMap((octokit) =>
    Effect.tryPromise({
      try: () =>
        octokit.request('GET /issues', {
          state: 'all',
          per_page: 100,
        }),
      catch: (e) => GithubApiError.from(e),
    }),
  ),
  Effect.map((response) => response.data),
);

export type MyIssuesResult = Effect.Effect.Success<typeof myIssues>;
