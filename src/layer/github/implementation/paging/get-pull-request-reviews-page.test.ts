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

import { GetPullRequestReviewsPageArgs } from './get-pull-request-reviews-page';

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
  });

  it('should retun data with links', async () => {
    await octokitMock.requestOnce({
      data: mockData,
      ...octokitRequestResponseHeaders(25),
    });

    const { getPullRequestReviewsPage } = await import(
      './get-pull-request-reviews-page'
    );

    const result = await Effect.runPromise(getPullRequestReviewsPage(args));

    expect(result.data).toStrictEqual(mockData);
    expect(result.links).toStrictEqual({ next: 2, last: 25 });
  });

  it('should fail with an Octokit request error', async () => {
    await octokitMock.requestFail(new GithubApiError({ cause: 'Oh no' }));

    const { getPullRequestReviewsPage } = await import(
      './get-pull-request-reviews-page'
    );

    const result = await Effect.runPromise(
      pipe(getPullRequestReviewsPage(args), Effect.flip),
    );

    expect(result).toBeInstanceOf(GithubApiError);
  });

  it('should retry three times if api rate limit is reached', async () => {
    const retryDelay = 20;
    const error = octokitRequestErrorWithRetryAfter(retryDelay);
    await octokitMock.requestFail(error);

    const { getPullRequestReviewsPage } = await import(
      './get-pull-request-reviews-page'
    );

    const effect = delayEffectAndFlip(
      getPullRequestReviewsPage(args),
      Duration.seconds(80),
    );
    const result = await Effect.runPromise(effect);

    expect(result).toBeInstanceOf(ApiRateLimitError);
    expectApiRateLimitMessages(error, retryDelay);
  });

  it('should retry two times and then succeed', async () => {
    const retryDelay = 20;
    const error = octokitRequestErrorWithRetryAfter(retryDelay);
    await octokitMock.requestFailAndThenSucceed(error, {
      data: mockData,
      ...octokitRequestResponseHeaders(25),
    });

    const { getPullRequestReviewsPage } = await import(
      './get-pull-request-reviews-page'
    );

    const effect = delayEffect(
      getPullRequestReviewsPage(args),
      Duration.seconds(40),
    );
    const result = await Effect.runPromise(effect);

    expect(console.warn).toHaveBeenCalledTimes(2);
    expect(result.data).toStrictEqual(mockData);
    expect(result.links).toStrictEqual({ next: 2, last: 25 });
  });
});
