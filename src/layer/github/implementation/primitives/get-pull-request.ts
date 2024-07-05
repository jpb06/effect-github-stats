import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { octokitCoreProvider } from '../../../providers/octokit-core.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';

export interface GetPullRequestArgs {
  owner: string;
  repo: string;
  number: number;
}

export const getPullRequest = ({ owner, repo, number }: GetPullRequestArgs) =>
  Effect.withSpan('get-pull-request', {
    attributes: { owner, repo, number },
  })(
    pipe(
      octokitCoreProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () =>
              octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
                owner,
                repo,
                pull_number: number,
              }),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule),
        ),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type PullRequestResult = EffectResultSuccess<typeof getPullRequest>;
