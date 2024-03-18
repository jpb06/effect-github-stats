import { Duration, Effect, pipe } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { expectApiRateLimitMessages } from '../../../../tests/assertions/api-rate-limite-message.assert';
import {
  delayEffect,
  delayEffectAndFlip,
} from '../../../../tests/effects/delay-effect';
import { mockData } from '../../../../tests/mock-data/data.mock-data';
import { octokitRequestErrorWithRetryAfter } from '../../../../tests/mock-data/octokit-request-error-with-retry-after.mock-data';
import { octokitRequestResponseHeaders } from '../../../../tests/mock-data/octokit-request-response-headers.mock-data';
import { mockConsole } from '../../../../tests/mocks/console.mock';
import { octokitMock } from '../../../../tests/mocks/octokit.mock';
import { ApiRateLimitError } from '../../../errors/api-rate-limit.error';
import { GithubApiError } from '../../../errors/github-api.error';

import { GetRepoPullRequestsPageArgs } from './get-repo-pull-requests-page';

vi.mock('@octokit/core');
mockConsole({
  warn: vi.fn(),
});

describe('getRepoPullRequestsPage effect', () => {
  const args: GetRepoPullRequestsPageArgs = {
    owner: 'cool',
    repo: 'cool',
    page: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retun data with links', async () => {
    await octokitMock.requestOnce({
      data: mockData,
      ...octokitRequestResponseHeaders(25),
    });

    const { getRepoPullRequestsPage } = await import(
      './get-repo-pull-requests-page'
    );

    const result = await Effect.runPromise(getRepoPullRequestsPage(args));

    expect(result.data).toStrictEqual(mockData);
    expect(result.links).toStrictEqual({ next: 2, last: 25 });
  });

  it('should fail with an Octokit request error', async () => {
    await octokitMock.requestFail(new GithubApiError({ cause: 'Oh no' }));

    const { getRepoPullRequestsPage } = await import(
      './get-repo-pull-requests-page'
    );

    const result = await Effect.runPromise(
      pipe(getRepoPullRequestsPage(args), Effect.flip),
    );

    expect(result).toBeInstanceOf(GithubApiError);
  });

  it('should fail if an api rate limit error', async () => {
    const retryDelay = 20;
    const error = octokitRequestErrorWithRetryAfter(retryDelay);
    await octokitMock.requestFail(error);

    const { getRepoPullRequestsPage } = await import(
      './get-repo-pull-requests-page'
    );

    const effect = delayEffectAndFlip(
      getRepoPullRequestsPage(args),
      Duration.seconds(40),
    );
    const result = await Effect.runPromise(effect);

    expect(result).toBeInstanceOf(ApiRateLimitError);
    expectApiRateLimitMessages(error, retryDelay);
  });

  it('should retry one time and then succeed', async () => {
    const retryDelay = 20;
    const error = octokitRequestErrorWithRetryAfter(retryDelay);
    await octokitMock.requestFailAndThenSucceed(error, {
      data: mockData,
      ...octokitRequestResponseHeaders(25),
    });

    const { getRepoPullRequestsPage } = await import(
      './get-repo-pull-requests-page'
    );

    const effect = delayEffect(
      getRepoPullRequestsPage(args),
      Duration.seconds(40),
    );
    const result = await Effect.runPromise(effect);

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(result.data).toStrictEqual(mockData);
    expect(result.links).toStrictEqual({ next: 2, last: 25 });
  });
});
