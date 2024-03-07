import { Effect } from 'effect';
import { match } from 'ts-pattern';

import { ConcurrencyArgs } from '../../../../types/concurrency-args.type';
import { EffectResultSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { getOrgReposPage } from '../paging/get-org-repos-page.effect';
import { getUserReposPage } from '../paging/get-user-repos-page.effect';

export interface GetRepositoriesArgs extends ConcurrencyArgs {
  target: string;
  type: 'org' | 'user';
}

const getPage =
  ({ target, type }: GetRepositoriesArgs) =>
  (page: number) =>
    match(type)
      .with('org', () =>
        getOrgReposPage({
          org: target,
          page,
        }),
      )
      .with('user', () =>
        getUserReposPage({
          username: target,
          page,
        }),
      )
      .exhaustive();

export const getRepositories = (args: GetRepositoriesArgs) =>
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

export type Repositories = EffectResultSuccess<typeof getRepositories>;
