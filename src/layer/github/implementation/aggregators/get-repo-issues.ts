import { Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { defaultConcurrency } from '../constants/default-concurrency.constant';
import { getRepoIssuesPage } from '../paging/get-repo-issues-page';

export interface GetRepoIssuesArgs {
  owner: string;
  repo: string;
  concurrency?: number;
}

const getPage = (args: GetRepoIssuesArgs) => (page: number) =>
  getRepoIssuesPage({
    ...args,
    page,
  });

export const getRepoIssues = (args: GetRepoIssuesArgs) =>
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

export type RepoIssuesResult = EffectResultSuccess<typeof getRepoIssues>;
