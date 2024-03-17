import { Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultConcurrency } from '../constants/default-concurrency.constant';
import { getRepoPullRequestsPage } from '../paging/get-repo-pull-requests-page';

export interface GetRepoPullRequestsArgs extends FlowOptions {
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
  Effect.withSpan(__filename, { attributes: { ...args } })(
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

export type RepoPullRequestsResult = EffectResultSuccess<
  typeof getRepoPullRequests
>;
