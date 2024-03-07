import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { GithubApiError } from '../../../errors/github-api.error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export const getUserOrgs = (username: string) =>
  Effect.withSpan(__filename, {
    attributes: { username },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        Effect.tryPromise({
          try: () =>
            octokit.request('GET /user/orgs', {
              username,
              per_page: 100,
            }),
          catch: (e) => new GithubApiError({ cause: e }),
        }),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type UserOrgsResult = EffectResultSuccess<typeof getUserOrgs>;
