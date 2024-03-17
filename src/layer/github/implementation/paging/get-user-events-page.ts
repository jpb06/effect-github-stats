import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../..';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultRetryCount } from '../constants/default-retry-count.constant';

export interface GetUserEventsPageArgs extends Pick<FlowOptions, 'retryCount'> {
  username: string;
  page: number;
}

export const getUserEventsPage = ({
  username,
  page,
  retryCount = defaultRetryCount,
}: GetUserEventsPageArgs) =>
  Effect.withSpan(__filename, {
    attributes: {
      username,
      page,
      retryCount,
    },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              octokit.request('GET /users/{username}/events', {
                username,
                per_page: 100,
                page,
              }),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule(retryCount)),
        ),
      ),
      Effect.map((response) => ({
        data: response.data,
        links: parseLink(response),
      })),
    ),
  );

export type EventsPageItems = EffectResultSuccess<typeof getUserEventsPage>;
