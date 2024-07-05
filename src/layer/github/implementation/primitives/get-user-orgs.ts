import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { octokitCoreProvider } from '../../../providers/octokit-core.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export const getUserOrgs = (username: string) =>
  Effect.withSpan('get-user-orgs', {
    attributes: { username },
  })(
    pipe(
      octokitCoreProvider,
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
          Effect.retry(retryAfterSchedule),
        ),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type UserOrgsResult = EffectResultSuccess<typeof getUserOrgs>;
