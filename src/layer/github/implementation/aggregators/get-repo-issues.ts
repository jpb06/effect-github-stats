import { Effect } from 'effect';

import { EffectResultSuccess } from '../../../../types/effect.types';
import { getAllPages } from '../generic/get-all-pages.effect';
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
  Effect.withSpan(__filename, {
    attributes: { ...args },
  })(getAllPages(getPage, args));

export type RepoIssuesResult = EffectResultSuccess<typeof getRepoIssues>;
