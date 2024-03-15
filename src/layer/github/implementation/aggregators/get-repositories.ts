import { Effect } from 'effect';
import { match } from 'ts-pattern';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { defaultConcurrency } from '../constants/default-concurrency.constant';
import { getOrgReposPage } from '../paging/get-org-repos-page';
import { getUserReposPage } from '../paging/get-user-repos-page';

export interface GetRepositoriesArgs {
  target: string;
  type: 'org' | 'user';
  concurrency?: number;
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
          concurrency: args.concurrency ?? defaultConcurrency,
        }),
      );

      return [...firstPage.data, ...pagesResults.flatMap((r) => r.data)];
    }),
  );

export type RepositoriesResult = EffectResultSuccess<typeof getRepositories>;
