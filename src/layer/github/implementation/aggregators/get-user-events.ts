import { Effect } from 'effect';

import { EffectResultSuccess } from '../../../..';
import { arrayRange } from '../../../../util/array-range.util';
import { FlowOptions } from '../../../types/flow-options.type';
import { defaultConcurrency } from '../constants/default-concurrency.constant';
import { getUserEventsPage } from '../paging/get-user-events-page';

export interface GetUserEventsArgs extends FlowOptions {
  username: string;
  concurrency?: number;
}

const getPage = (args: GetUserEventsArgs) => (page: number) =>
  getUserEventsPage({
    ...args,
    page,
  });

export const getUserEvents = (args: GetUserEventsArgs) =>
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

export type UserEventsResult = EffectResultSuccess<typeof getUserEvents>;
