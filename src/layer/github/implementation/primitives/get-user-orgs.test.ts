import { Duration, Effect, pipe } from 'effect';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GithubApiError } from '../../../..';
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

vi.mock('@octokit/core');
mockConsole({
  warn: vi.fn(),
});

describe('getUserOrgs effect', () => {
  const username = 'yolo';

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should retun data with links', async () => {
    octokitMock.requestOnce({
      data: mockData,
    });

    const { getUserOrgs } = await import('./get-user-orgs');

    const result = await Effect.runPromise(getUserOrgs(username));

    expect(result).toStrictEqual(mockData);
  });

  it('should fail with an Octokit request error', async () => {
    octokitMock.requestFail(new GithubApiError({ cause: 'Oh no' }));

    const { getUserOrgs } = await import('./get-user-orgs');

    const result = await Effect.runPromise(
      pipe(getUserOrgs(username), Effect.flip),
    );

    expect(result).toBeInstanceOf(GithubApiError);
  });

  it('should retry three times if api rate limit is reached', async () => {
    const retryDelay = 20;
    const error = octokitRequestErrorWithRetryAfter(retryDelay);
    await octokitMock.requestFail(error);

    const { getUserOrgs } = await import('./get-user-orgs');

    const effect = delayEffectAndFlip(
      getUserOrgs(username),
      Duration.seconds(80),
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

    const { getUserOrgs } = await import('./get-user-orgs');
    const effect = delayEffect(getUserOrgs(username), Duration.seconds(40));
    const result = await Effect.runPromise(effect);

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(mockData);
  });
});
