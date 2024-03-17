import { retryWarningMessage } from '../github/implementation/constants/retry-warning-message.constant';

import { ApiRateLimitError } from './api-rate-limit.error';
import { GithubApiError } from './github-api.error';

interface WithMaybeRetryAfter {
  response?: { headers?: { 'retry-after'?: number } };
}

export const handleOctokitRequestError = (e: unknown) => {
  const retryAfter = (e as WithMaybeRetryAfter)?.response?.headers?.[
    'retry-after'
  ];
  if (retryAfter) {
    console.warn(retryWarningMessage(e, retryAfter));

    return new ApiRateLimitError({
      retryAfter,
    });
  }

  return new GithubApiError({ cause: e });
};
