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

import { GetPullRequestArgs } from './get-pull-request';

vi.mock('@octokit/core');
mockConsole({
  warn: vi.fn(),
});

describe('getIssue effect', () => {
  const args: GetPullRequestArgs = {
    owner: 'cool',
    repo: 'cool',
    number: 1,
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should retun data with links', async () => {
    octokitMock.requestOnce({
      data: mockData,
    });

    const { getPullRequest } = await import('./get-pull-request');

    const result = await Effect.runPromise(getPullRequest(args));

    expect(result).toStrictEqual(mockData);
  });

  it('should fail with an Octokit request error', async () => {
    octokitMock.requestFail(new GithubApiError({ cause: 'Oh no' }));

    const { getPullRequest } = await import('./get-pull-request');

    const result = await Effect.runPromise(
      pipe(getPullRequest(args), Effect.flip),
    );

    expect(result).toBeInstanceOf(GithubApiError);
  });

  it('should fail if an api rate limit error', async () => {
    const retryDelay = 20;
    const error = octokitRequestErrorWithRetryAfter(retryDelay);
    await octokitMock.requestFail(error);

    const { getPullRequest } = await import('./get-pull-request');

    const effect = delayEffectAndFlip(
      getPullRequest(args),
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

    const { getPullRequest } = await import('./get-pull-request');

    const effect = delayEffect(getPullRequest(args), Duration.seconds(40));
    const result = await Effect.runPromise(effect);

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(mockData);
  });
});
