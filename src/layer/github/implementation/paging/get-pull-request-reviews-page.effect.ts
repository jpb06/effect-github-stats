import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { GithubApiError } from '../../../errors/github-api.error';
import { parseLink } from '../../../logic/parse-link.logic';
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
  Effect.withSpan(__filename, {
    attributes: {
      owner,
      repo,
      pullNumber,
      page,
    },
  })(
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
          catch: (e) => new GithubApiError({ cause: e }),
        }),
      ),
      Effect.map((response) => ({
        data: response.data,
        links: parseLink(response),
      })),
    ),
  );

export type PullRequestReviewsPage = EffectResultSuccess<
  typeof getPullRequestReviewsPage
>;
