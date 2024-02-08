import { Effect, pipe } from 'effect';

import { GithubApiError } from '../../../errors/github-api.error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export const myProfile = pipe(
  githubSourceAnalysisProvider,
  Effect.flatMap((octokit) =>
    Effect.tryPromise({
      try: () => octokit.request('GET /user'),
      catch: (e) => GithubApiError.from(e),
    }),
  ),
  Effect.map((response) => response.data),
);

export type MyProfileResult = Effect.Effect.Success<typeof myProfile>;
