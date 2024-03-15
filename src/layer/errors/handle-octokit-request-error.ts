import chalk from 'chalk';

import { ApiRateLimitError } from './api-rate-limit.error';
import { GithubApiError } from './github-api.error';

interface WithMaybeRetryAfter {
  response?: { headers?: { 'retry-after'?: number } };
}
interface WithRequestUrl {
  request: { url: string };
}

export const handleOctokitRequestError = (e: unknown) => {
  const retryAfter = (e as WithMaybeRetryAfter)?.response?.headers?.[
    'retry-after'
  ];
  if (retryAfter) {
    console.warn(
      chalk.hex('#FFA500')(
        `⚠️ Rate limit error on '${(e as WithRequestUrl).request.url.replace(
          'https://api.github.com',
          '',
        )}' ⏳ retrying in ${retryAfter} seconds.`,
      ),
    );

    return new ApiRateLimitError({
      retryAfter,
    });
  }

  return new GithubApiError({ cause: e });
};
