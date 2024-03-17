import { Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultConcurrency } from '../constants/default-concurrency.constant';
import { getPullRequestReviewsPage } from '../paging/get-pull-request-reviews-page';

export interface GetPullRequestReviewsArgs extends FlowOptions {
  owner: string;
  repo: string;
  pullNumber: number;
}

const getPage = (args: GetPullRequestReviewsArgs) => (page: number) =>
  getPullRequestReviewsPage({
    ...args,
    page,
  });

export const getPullRequestReviews = (args: GetPullRequestReviewsArgs) =>
  Effect.withSpan(__filename, {
    attributes: { ...args },
  })(
    Effect.gen(function* (_) {
      const firstPage = yield* _(getPage(args)(1));
      if (firstPage.links?.last === undefined) {
        return firstPage.data;
      }

      const pagesResults = yield* _(
        Effect.all(arrayRange(2, firstPage.links.last).map(getPage(args)), {
          concurrency: args.concurrency ?? defaultConcurrency,
        }),
      );

      return [...firstPage.data, ...pagesResults.flatMap((r) => r.data)];
    }),
  );

export type PullRequestReviewsResult = EffectResultSuccess<
  typeof getPullRequestReviews
>;
