import { Effect } from 'effect';
import { match } from 'ts-pattern';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { getAllPages } from '../generic/get-all-pages.effect';
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
  Effect.withSpan(__filename, {
    attributes: { ...args },
  })(getAllPages(getPage, args));

export type RepositoriesResult = EffectResultSuccess<typeof getRepositories>;
