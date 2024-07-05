import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { octokitCoreProvider } from '../../../providers/octokit-core.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export interface GetIssueArgs {
  owner: string;
  repo: string;
  number: number;
}

export const getIssue = ({ owner, repo, number }: GetIssueArgs) =>
  Effect.withSpan('get-issue', {
    attributes: { owner, repo, number },
  })(
    pipe(
      octokitCoreProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              octokit.request(
                'GET /repos/{owner}/{repo}/issues/{issue_number}',
                {
                  owner,
                  repo,
                  issue_number: number,
                },
              ),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule),
        ),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type IssueResult = EffectResultSuccess<typeof getIssue>;
