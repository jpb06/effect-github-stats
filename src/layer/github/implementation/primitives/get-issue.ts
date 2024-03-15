import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export interface GetIssueArgs {
  owner: string;
  repo: string;
  number: number;
}

export const getIssue = (args: GetIssueArgs) =>
  Effect.withSpan(__filename, {
    attributes: { ...args },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              octokit.request(
                'GET /repos/{owner}/{repo}/issues/{issue_number}',
                {
                  owner: args.owner,
                  repo: args.repo,
                  issue_number: args.number,
                },
              ),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule(3)),
        ),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type IssueResult = EffectResultSuccess<typeof getIssue>;
