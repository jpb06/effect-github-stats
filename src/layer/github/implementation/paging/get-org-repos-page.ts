import { Effect, pipe } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { handleOctokitRequestError } from '../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../logic/parse-link.logic';
import { githubSourceAnalysisProvider } from '../../../providers/github-source-analysis.provider';
import { retryAfterSchedule } from '../../../schedules/retry-after.schedule';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultRetryCount } from '../constants/default-retry-count.constant';

export interface GetOrgReposPageArgs extends Pick<FlowOptions, 'retryCount'> {
  org: string;
  page: number;
}

export const getOrgReposPage = ({
  org,
  page,
  retryCount = defaultRetryCount,
}: GetOrgReposPageArgs) =>
  Effect.withSpan(__filename, {
    attributes: {
      org,
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
              octokit.request('GET /orgs/{org}/repos', {
                org,
                type: 'all',
                per_page: 100,
                page,
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

export type OrgReposPageItems = EffectResultSuccess<typeof getOrgReposPage>;
