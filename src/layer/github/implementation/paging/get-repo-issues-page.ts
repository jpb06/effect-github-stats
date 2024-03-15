import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../..';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export interface GetRepoIssuesPageArgs {
  owner: string;
  repo: string;
  page: number;
}

export const getRepoIssuesPage = (args: GetRepoIssuesPageArgs) =>
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
              octokit.request('GET /repos/{owner}/{repo}/issues', {
                ...args,
                per_page: 100,
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

export type IssuesPageItems = EffectResultSuccess<typeof getRepoIssuesPage>;
