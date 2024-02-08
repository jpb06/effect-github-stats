import { Effect } from 'effect';

import { EffectSuccess } from '../../../../types/effect.types';
import { arrayRange } from '../../../../util/array-range.util';
import { getRepoPullRequestsPage } from '../primitives/get-repo-pull-requests-page.effect';

export interface GetRepoPullRequestsArgs {
  owner: string;
  repo: string;
}

const getPage = (args: GetRepoPullRequestsArgs) => (page: number) =>
  getRepoPullRequestsPage({
    ...args,
    page,
  });

export const getRepoPullRequests = (args: GetRepoPullRequestsArgs) =>
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

export type RepoPullRequests = EffectSuccess<typeof getRepoPullRequests>;
