import { EffectSuccess } from '@common/types';
import { Effect } from 'effect';

import { getRepoActivityPage } from '../implementation/primitives/get-pull-request-reviews-page.effect';

export interface GetRepoActivityArgs {
  owner: string;
  repo: string;
  username: string;
}

export const getRepoActivity = ({
  owner,
  repo,
  username,
}: GetRepoActivityArgs) =>
  Effect.gen(function* (_) {
    const r = yield* _(
      getRepoActivityPage({ owner, repo, actor: username, prev: 1, next: 2 }),
    );

    return r.data;
  });

export type RepoActivityItems = EffectSuccess<typeof getRepoActivity>;
