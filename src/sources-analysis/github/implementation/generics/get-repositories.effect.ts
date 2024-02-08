import { Effect } from 'effect';
import { match } from 'ts-pattern';

import { EffectSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { fetchAll } from '../aggregators/fetch-all.effect';
import { getOrgReposPage } from '../primitives/get-org-repos-page.effect';
import { getUserReposPage } from '../primitives/get-user-repos-page.effect';

export interface GetRepositoriesArgs {
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

const a = (args: GetRepositoriesArgs) => fetchAll(getPage, args);
const b: EffectSuccess<typeof a>;
b.at(9);
// // a({
// //   target: ""
// // })

export const getRepositories = (args: GetRepositoriesArgs) =>
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

    return [...firstPage.data, ...pagesResults.flatMap((r) => r.data)];
  });

export type Repositories = EffectSuccess<typeof getRepositories>;
