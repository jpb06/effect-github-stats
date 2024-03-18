import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../..';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export interface GetUserEventsPageArgs {
  username: string;
  page: number;
}

export const getUserEventsPage = (args: GetUserEventsPageArgs) =>
  Effect.withSpan(__filename, {
    attributes: {
      ...args,
    },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              octokit.request('GET /users/{username}/events', {
                ...args,
                per_page: 100,
              }),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule),
        ),
      ),
      Effect.map((response) => ({
        data: response.data,
        links: parseLink(response),
      })),
    ),
  );

export type EventsPageItems = EffectResultSuccess<typeof getUserEventsPage>;
