import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { GithubApiError } from '../../../errors/github-api.error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';

export interface GetOrgReposPageArgs {
  org: string;
  page: number;
}

export const getOrgReposPage = ({ org, page }: GetOrgReposPageArgs) =>
  Effect.withSpan(__filename, {
    attributes: {
      org,
      page,
    },
  })(
    pipe(
      githubSourceAnalysisProvider,
      Effect.flatMap((octokit) =>
        Effect.tryPromise({
          try: () =>
            octokit.request('GET /orgs/{org}/repos', {
              org,
              type: 'all',
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

export type OrgReposPage = EffectResultSuccess<typeof getOrgReposPage>;
