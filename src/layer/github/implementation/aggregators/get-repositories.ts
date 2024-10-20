import { Effect } from 'effect';
import { match } from 'ts-pattern';

import type { EffectResultSuccess } from '@types';
import { getAllPages } from '../generic/get-all-pages.effect.js';
import { getOrgReposPage } from '../paging/get-org-repos-page.js';
import { getUserReposPage } from '../paging/get-user-repos-page.js';

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
  Effect.withSpan('get-repositories', {
    attributes: { ...args },
  })(getAllPages(getPage, args));

export type RepositoriesResult = EffectResultSuccess<typeof getRepositories>;
