import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { GithubApiError } from '../../../errors/github-api.error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export interface GetUserReposPageArgs {
  username: string;
  page: number;
}

export const getUserReposPage = ({ username, page }: GetUserReposPageArgs) =>
  Effect.withSpan(__filename, {
    attributes: {
      username,
      page,
    },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        Effect.tryPromise({
          try: () =>
            octokit.request('GET /users/{username}/repos', {
              username,
              type: 'all',
              per_page: 100,
              page,
            }),
          catch: (e) => new GithubApiError({ cause: e }),
        }),
      ),
      Effect.map((response) => ({
        data: response.data,
        links: parseLink(response),
      })),
    ),
  );

export type UserReposPage = EffectResultSuccess<typeof getUserReposPage>;
