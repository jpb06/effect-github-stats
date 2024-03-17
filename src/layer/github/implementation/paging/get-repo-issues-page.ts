import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../..';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultRetryCount } from '../constants/default-retry-count.constant';

export interface GetRepoIssuesPageArgs extends Pick<FlowOptions, 'retryCount'> {
  owner: string;
  repo: string;
  page: number;
}

export const getRepoIssuesPage = ({
  owner,
  repo,
  page,
  retryCount = defaultRetryCount,
}: GetRepoIssuesPageArgs) =>
  Effect.withSpan(__filename, {
    attributes: {
      owner,
      repo,
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
              octokit.request('GET /repos/{owner}/{repo}/issues', {
                owner,
                repo,
                page,
                per_page: 100,
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

export type IssuesPageItems = EffectResultSuccess<typeof getRepoIssuesPage>;
