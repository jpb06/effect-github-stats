import { EffectSuccess } from '@common/types';
import { GithubApiError } from '@errors';
import { Effect, pipe } from 'effect';

import { githubSourceAnalysisProvider } from '../../providers/github-source-analysis.provider';

export const getEventsPage = (page: number) =>
  pipe(
    githubSourceAnalysisProvider,
    Effect.flatMap((octokit) =>
      Effect.tryPromise({
        try: () =>
          octokit.request('GET /users/{username}/events', {
            username: 'jpb06',
            per_page: 100,
            page,
          }),
        catch: (e) => GithubApiError.from(e),
      }),
    ),
  );

export type EventsPageItems = EffectSuccess<typeof getEventsPage>['data'];
