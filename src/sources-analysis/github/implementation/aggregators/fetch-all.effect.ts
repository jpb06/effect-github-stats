import { ConfigError, Effect } from 'effect';

import { arrayRange } from '../../../../util/array-range.util';
import { GithubApiError } from '../../../errors/github-api.error';

// type GetElementType<T extends unknown[]> = T extends (infer U)[] ? U : never;

interface FnResult<TData, TItem> {
  data: TData extends (infer TItem)[] ? TItem[] : TItem;
  links?: { last?: number };
}

type GetPageFn<TArgs, TData, TItem> = (
  args: TArgs,
) => (
  page: number,
) => Effect.Effect<
  never,
  GithubApiError | ConfigError.ConfigError,
  FnResult<TData, TItem>
>;

export const fetchAll = <
  TItem,
  // TData extends TItem[],
  TArgs,
  TGetPageFn extends GetPageFn<TArgs, TItem[], TItem>,
>(
  getPage: TGetPageFn,
  args: TArgs,
): Effect.Effect<never, GithubApiError | ConfigError.ConfigError, TItem[]> =>
  Effect.gen(function* (_) {
    const firstPage = yield* _(getPage(args)(1));
    if (firstPage.links?.last === undefined) {
      return firstPage.data;
    }

    const pagesResults = yield* _(
      Effect.all(arrayRange(2, firstPage.links.last).map(getPage(args)), {
        concurrency: 10,
      }),
    );

    const othersPagesData = pagesResults.flatMap((r) => r.data);

    return [...firstPage.data, ...othersPagesData];
  });
