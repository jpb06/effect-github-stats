import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultRetryCount } from '../constants/default-retry-count.constant';

export interface GetPullRequestArgs extends Pick<FlowOptions, 'retryCount'> {
  owner: string;
  repo: string;
  number: number;
}

export const getPullRequest = ({
  owner,
  repo,
  number,
  retryCount = defaultRetryCount,
}: GetPullRequestArgs) =>
  Effect.withSpan(__filename, {
    attributes: { owner, repo, number, retryCount },
  })(
    pipe(
      githubSourceAnalysisProvider,
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
          Effect.retry(retryAfterSchedule(retryCount)),
        ),
      ),
      Effect.map((response) => response.data),
    ),
  );

export type PullRequestResult = EffectResultSuccess<typeof getPullRequest>;
