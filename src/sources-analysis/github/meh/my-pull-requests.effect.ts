import { Effect } from 'effect';

import { arrayRange } from '@common/util';

import {
  getPullRequestsPage,
  PullRequestsPageItems,
} from './get-pull-requests-page.effect';

export const myPullRequests = Effect.gen(function* (_) {
  const firstPage = yield* _(getPullRequestsPage(1));

  const additionalResults: PullRequestsPageItems = [];
  if (firstPage.data.total_count > 100) {
    const pagesToFetch = Math.ceil(firstPage.data.total_count / 100);

    const pagesResults = yield* _(
      Effect.all(arrayRange(2, pagesToFetch).map(getPullRequestsPage), {
        concurrency: 'unbounded',
      }),
    );
    additionalResults.push(...pagesResults.flatMap((r) => r.data.items));
  }

  return [...firstPage.data.items, ...additionalResults];
});
