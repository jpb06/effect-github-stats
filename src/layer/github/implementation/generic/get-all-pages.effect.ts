import { Effect } from 'effect';

import { arrayRange } from '../../../../util/array-range.util';
import { defaultConcurrency } from '../constants/default-concurrency.constant';

type LinkKey = 'prev' | 'next' | 'last';

interface DataWithLinks<TData> {
  links: Record<LinkKey, number | undefined> | undefined;
  data: TData;
}

type GetPage<TArgs, TData, TError> = (
  args: TArgs,
) => (page: number) => Effect.Effect<DataWithLinks<TData>, TError>;

export const getAllPages = <
  TError,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs extends { concurrency?: number } & Record<string, any>,
  TDataItem,
  TData extends TDataItem[],
>(
  getPage: GetPage<TArgs, TData, TError>,
  args: TArgs,
) =>
  Effect.withSpan('get-all-pages', {
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

      return [
        ...firstPage.data,
        ...pagesResults.flatMap((r) => r.data),
      ] as TData;
    }),
  );
