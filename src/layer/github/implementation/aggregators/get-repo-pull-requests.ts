import { Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { getAllPages } from '../generic/get-all-pages.effect';
import { getRepoPullRequestsPage } from '../paging/get-repo-pull-requests-page';

export interface GetRepoPullRequestsArgs {
  owner: string;
  repo: string;
  concurrency?: number;
}

const getPage = (args: GetRepoPullRequestsArgs) => (page: number) =>
  getRepoPullRequestsPage({
    ...args,
    page,
  });

export const getRepoPullRequests = (args: GetRepoPullRequestsArgs) =>
  Effect.withSpan(__filename, {
    attributes: { ...args },
  })(getAllPages(getPage, args));

export type RepoPullRequestsResult = EffectResultSuccess<
  typeof getRepoPullRequests
>;
