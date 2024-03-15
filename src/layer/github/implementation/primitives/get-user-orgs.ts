import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export const getUserOrgs = (username: string) =>
  Effect.withSpan(__filename, {
    attributes: { username },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              octokit.request('GET /user/orgs', {
                username,
                per_page: 100,
              }),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule(3)),
        ),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type UserOrgsResult = EffectResultSuccess<typeof getUserOrgs>;
