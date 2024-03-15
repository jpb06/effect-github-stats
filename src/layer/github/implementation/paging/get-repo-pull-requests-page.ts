import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export interface GetRepoPullRequestsPageArgs {
  owner: string;
  repo: string;
  page: number;
}

export const getRepoPullRequestsPage = (args: GetRepoPullRequestsPageArgs) =>
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
              octokit.request('GET /repos/{owner}/{repo}/pulls', {
                state: 'all',
                per_page: 100,
                ...args,
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

export type RepoPullRequestsPageItems = EffectResultSuccess<
  typeof getRepoPullRequestsPage
>;
