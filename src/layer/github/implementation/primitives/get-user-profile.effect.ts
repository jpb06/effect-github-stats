import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { GithubApiError } from '../../../errors/github-api.error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export const getUserProfile = (username: string) =>
  Effect.withSpan(__filename, {
    attributes: { username },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        Effect.tryPromise({
          try: () => octokit.request('GET /user'),
          catch: (e) => new GithubApiError({ cause: e }),
        }),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type UserProfileResult = EffectResultSuccess<typeof getUserProfile>;
