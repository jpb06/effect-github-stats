import { EffectResultSuccess } from '../../../../types/effect.types';
import { getOnePage } from '../generic/get-one-page/get-one-page.effect';

export interface GetRepoPullRequestsPageArgs {
  owner: string;
  repo: string;
  page: number;
}

export const getRepoPullRequestsPage = (args: GetRepoPullRequestsPageArgs) =>
  getOnePage('get-repo-pull-requests-page', 'GET /repos/{owner}/{repo}/pulls', {
    ...args,
    state: 'all',
    per_page: 100,
  });

export type RepoPullRequestsPageItems = EffectResultSuccess<
  typeof getRepoPullRequestsPage
>;
