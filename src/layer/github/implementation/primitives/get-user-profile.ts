import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { octokitCoreProvider } from '../../../providers/octokit-core.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export const getUserProfile = (username: string) =>
  Effect.withSpan('get-user-profile', {
    attributes: { username },
  })(
    pipe(
      octokitCoreProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () => octokit.request('GET /user'),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule),
        ),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type UserProfileResult = EffectResultSuccess<typeof getUserProfile>;
