import { pipe, Effect } from 'effect';

import { GithubApiError } from '../../../errors/github-api.error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export const myOrgs = pipe(
  githubSourceAnalysisProvider,
  Effect.flatMap((octokit) =>
    Effect.tryPromise({
      try: () =>
        octokit.request('GET /user/orgs', {
          username: 'jpb06',
          per_page: 100,
        }),
      catch: (e) => GithubApiError.from(e),
    }),
  ),
  Effect.map((response) => response.data),
);

export type MyOrgsResult = Effect.Effect.Success<typeof myOrgs>;
