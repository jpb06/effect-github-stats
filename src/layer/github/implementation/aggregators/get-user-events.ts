import { Effect } from 'effect';

import { EffectResultSuccess } from '../../../..';
import { getAllPages } from '../generic/get-all-pages.effect';
import { getUserEventsPage } from '../paging/get-user-events-page';

export interface GetUserEventsArgs {
  username: string;
  concurrency?: number;
}

const getPage = (args: GetUserEventsArgs) => (page: number) =>
  getUserEventsPage({
    ...args,
    page,
  });

export const getUserEvents = (args: GetUserEventsArgs) =>
  Effect.withSpan(__filename, {
    attributes: { ...args },
  })(getAllPages(getPage, args));

export type UserEventsResult = EffectResultSuccess<typeof getUserEvents>;
