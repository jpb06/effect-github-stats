import { Effect, pipe } from 'effect';

import { EffectSuccess } from '../../../../types/effect.types';
import { GithubApiError } from '../../../errors/github-api.error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export interface GetUserReposPageArgs {
  username: string;
  page: number;
}

export const getUserReposPage = ({ username, page }: GetUserReposPageArgs) =>
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
        catch: (e) => GithubApiError.from(e),
      }),
    ),
    Effect.map((response) => ({
      data: response.data,
      links: parseLink(response),
    })),
  );

export type UserReposPage = EffectSuccess<typeof getUserReposPage>;
