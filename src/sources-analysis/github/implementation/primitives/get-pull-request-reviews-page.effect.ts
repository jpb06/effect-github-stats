import { Effect, pipe } from 'effect';

import { EffectSuccess } from '../../../../types/effect.types';
import { GithubApiError } from '../../../errors/github-api.error';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export interface GetPullRequestReviewsPageArgs {
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
}: GetPullRequestReviewsPageArgs) =>
  pipe(
    githubSourceAnalysisProvider,
    Effect.flatMap((octokit) =>
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
        catch: (e) => GithubApiError.from(e),
      }),
    ),
    Effect.map((response) => response.data),
  );

export type PullRequestReviewsPage = EffectSuccess<
  typeof getPullRequestReviewsPage
>;
