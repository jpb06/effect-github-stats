import { type Endpoints } from '@octokit/types';
import { RequestParameters } from '@octokit/types/dist-types/RequestParameters';
import { Effect, pipe } from 'effect';

import { handleOctokitRequestError } from '../../../../errors/handle-octokit-request-error';
import { parseLink } from '../../../../logic/parse-link.logic';
import { octokitCoreProvider } from '../../../../providers/octokit-core.provider';
import { retryAfterSchedule } from '../../../../schedules/retry-after.schedule';

import { octokitRequest } from './logic/octokit-request.logic';

export const getOnePage = <E extends keyof Endpoints>(
  span: string,
  route: E,
  options?: Endpoints[E]['parameters'] & RequestParameters,
) =>
  Effect.withSpan(span, {
    attributes: {
      ...options,
    },
  })(
    pipe(
      octokitCoreProvider,
      Effect.flatMap((octokit) =>
        pipe(
          Effect.tryPromise({
            try: () => octokitRequest(octokit)<E>(route, options),
            catch: handleOctokitRequestError,
          }),
          Effect.retry(retryAfterSchedule),
        ),
      ),
      Effect.map((response) => ({
        data: response.data as Endpoints[E]['response']['data'],
        links: parseLink(response),
      })),
    ),
  );
