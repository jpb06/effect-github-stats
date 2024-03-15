import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

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
        pipe(
          Effect.tryPromise({
            try: () =>
              octokit.request('GET /users/{username}/repos', {
                username,
                type: 'all',
                per_page: 100,
                page,
              }),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule(3)),
        ),
      ),
      Effect.map((response) => ({
        data: response.data,
        links: parseLink(response),
      })),
    ),
  );

export type UserReposPageItems = EffectResultSuccess<typeof getUserReposPage>;
