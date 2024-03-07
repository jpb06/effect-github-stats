import { Effect } from 'effect';

import { ConcurrencyArgs } from '../../../../types/concurrency-args.type';
import { EffectResultSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { getPullRequestReviewsPage } from '../paging/get-pull-request-reviews-page.effect';

export interface GetPullRequestReviewsArgs extends ConcurrencyArgs {
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
          concurrency: args.paging ?? 10,
        }),
      );

      return [...firstPage.data, ...pagesResults.flatMap((r) => r.data)];
    }),
  );

export type PullRequestReviews = EffectResultSuccess<
  typeof getPullRequestReviews
>;
