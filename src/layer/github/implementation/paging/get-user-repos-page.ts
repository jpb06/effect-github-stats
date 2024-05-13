import { EffectResultSuccess } from '../../../../types/effect.types';
import { getOnePage } from '../generic/get-one-page/get-one-page.effect';

export interface GetUserReposPageArgs {
  username: string;
  page: number;
}

export const getUserReposPage = (args: GetUserReposPageArgs) =>
  getOnePage('get-user-repos-page', 'GET /users/{username}/repos', {
    ...args,
    type: 'all',
    per_page: 100,
  });

export type UserReposPageItems = EffectResultSuccess<typeof getUserReposPage>;
