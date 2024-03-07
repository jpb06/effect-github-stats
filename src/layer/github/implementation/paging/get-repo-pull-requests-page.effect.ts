import { pipe, Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { GithubApiError } from '../../../errors/github-api.error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export interface GetRepoPullRequestsPageArgs {
  owner: string;
  repo: string;
  page: number;
}

export const getRepoPullRequestsPage = ({
  owner,
  repo,
  page,
}: GetRepoPullRequestsPageArgs) =>
  Effect.withSpan(__filename, {
    attributes: {
      owner,
      repo,
      page,
    },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        Effect.tryPromise({
          try: () =>
            octokit.request('GET /repos/{owner}/{repo}/pulls', {
              owner,
              repo,
              state: 'all',
              per_page: 100,
              page,
            }),
          catch: (e) => new GithubApiError({ cause: e }),
        }),
      ),
      Effect.map((response) => ({
        data: response.data,
        links: parseLink(response),
      })),
    ),
  );

export type RepoPullRequestsPage = EffectResultSuccess<
  typeof getRepoPullRequestsPage
>;
