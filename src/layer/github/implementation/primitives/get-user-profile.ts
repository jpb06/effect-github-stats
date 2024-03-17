import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultRetryCount } from '../constants/default-retry-count.constant';

export interface GetUserProfileArgs extends Pick<FlowOptions, 'retryCount'> {
  username: string;
}

export const getUserProfile = ({
  username,
  retryCount = defaultRetryCount,
}: GetUserProfileArgs) =>
  Effect.withSpan(__filename, {
    attributes: { username, retryCount },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () => octokit.request('GET /user'),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule(retryCount)),
        ),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type UserProfileResult = EffectResultSuccess<typeof getUserProfile>;
