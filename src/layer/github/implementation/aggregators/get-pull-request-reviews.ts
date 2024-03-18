import { Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { getAllPages } from '../generic/get-all-pages.effect';
import { getPullRequestReviewsPage } from '../paging/get-pull-request-reviews-page';

export interface GetPullRequestReviewsArgs {
  owner: string;
  repo: string;
  pullNumber: number;
  concurrency?: number;
}

const getPage = (args: GetPullRequestReviewsArgs) => (page: number) =>
  getPullRequestReviewsPage({
    ...args,
    page,
  });

export const getPullRequestReviews = (args: GetPullRequestReviewsArgs) =>
  Effect.withSpan(__filename, {
    attributes: { ...args },
  })(getAllPages(getPage, args));

export type PullRequestReviewsResult = EffectResultSuccess<
  typeof getPullRequestReviews
>;
