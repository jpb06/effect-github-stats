import { Effect } from 'effect';

import { ConcurrencyArgs } from '../../../../types/concurrency-args.type';
import { EffectResultSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { getRepoPullRequestsPage } from '../paging/get-repo-pull-requests-page.effect';

export interface GetRepoPullRequestsArgs extends ConcurrencyArgs {
  owner: string;
  repo: string;
}

const getPage = (args: GetRepoPullRequestsArgs) => (page: number) =>
  getRepoPullRequestsPage({
    ...args,
    page,
  });

export const getRepoPullRequests = (args: GetRepoPullRequestsArgs) =>
  Effect.withSpan(__filename, { attributes: { ...args } })(
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

export type RepoPullRequests = EffectResultSuccess<typeof getRepoPullRequests>;
