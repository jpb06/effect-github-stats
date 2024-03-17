import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultRetryCount } from '../constants/default-retry-count.constant';

export interface GetPullRequestReviewsPageArgs
  extends Pick<FlowOptions, 'retryCount'> {
  owner: string;
  repo: string;
  pullNumber: number;
  page: number;
}

export const getPullRequestReviewsPage = ({
  owner,
  repo,
  pullNumber,
  page,
  retryCount = defaultRetryCount,
}: GetPullRequestReviewsPageArgs) =>
  Effect.withSpan(__filename, {
    attributes: {
      owner,
      repo,
      pullNumber,
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
              octokit.request(
                'GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews',
                {
                  owner,
                  repo,
                  pull_number: pullNumber,
                  per_page: 100,
                  page,
                },
              ),
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

export type PullRequestReviewsPageItems = EffectResultSuccess<
  typeof getPullRequestReviewsPage
>;
