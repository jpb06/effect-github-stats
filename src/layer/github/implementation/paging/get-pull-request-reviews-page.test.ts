import { Duration, Effect, pipe } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiRateLimitError, GithubApiError } from '@errors';
import { expectApiRateLimitMessages } from '@tests/assertions';
import { delayEffect, delayEffectAndFlip } from '@tests/effects';
import {
  mockData,
  octokitRequestErrorWithRetryAfter,
  octokitRequestResponseHeaders,
} from '@tests/mock-data';
import { mockConsole, octokitMock } from '@tests/mocks';

import { GetPullRequestReviewsPageArgs } from './get-pull-request-reviews-page.js';

vi.mock('@octokit/core');
mockConsole({
  warn: vi.fn(),
});

describe('getPullRequestReviewsPage effect', () => {
  const args: GetPullRequestReviewsPageArgs = {
    owner: 'cool',
    repo: 'cool',
    pullNumber: 1,
    page: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GITHUB_TOKEN', 'GITHUB_TOKEN_VALUE');
  });

  it('should retun data with links', async () => {
    await octokitMock.requestOnce({
      data: mockData,
      ...octokitRequestResponseHeaders(25),
    });

    const { getPullRequestReviewsPage } = await import(
      './get-pull-request-reviews-page.js'
    );

    const result = await Effect.runPromise(getPullRequestReviewsPage(args));

    expect(result.data).toStrictEqual(mockData);
    expect(result.links).toStrictEqual({ next: 2, last: 25 });
  });

  it('should fail with an Octokit request error', async () => {
    await octokitMock.requestFail(new GithubApiError({ cause: 'Oh no' }));

    const { getPullRequestReviewsPage } = await import(
      './get-pull-request-reviews-page.js'
    );

    const result = await Effect.runPromise(
      pipe(getPullRequestReviewsPage(args), Effect.flip),
    );

    expect(result).toBeInstanceOf(GithubApiError);
  });

  it('should fail if an api rate limit error', async () => {
    const retryDelay = 20;
    const error = octokitRequestErrorWithRetryAfter(retryDelay);
    await octokitMock.requestFail(error);

    const { getPullRequestReviewsPage } = await import(
      './get-pull-request-reviews-page.js'
    );

    const effect = delayEffectAndFlip(
      getPullRequestReviewsPage(args),
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

    const { getPullRequestReviewsPage } = await import(
      './get-pull-request-reviews-page.js'
    );

    const effect = delayEffect(
      getPullRequestReviewsPage(args),
      Duration.seconds(40),
    );
    const result = await Effect.runPromise(effect);

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(result.data).toStrictEqual(mockData);
    expect(result.links).toStrictEqual({ next: 2, last: 25 });
  });
});
