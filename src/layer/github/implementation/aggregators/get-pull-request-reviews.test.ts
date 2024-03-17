import { Effect, pipe } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockData } from '../../../../tests/mock-data/data.mock-data';
import { octokitRequestResponseHeaders } from '../../../../tests/mock-data/octokit-request-response-headers.mock-data';
import { mockConsole } from '../../../../tests/mocks/console.mock';
import { octokitMock } from '../../../../tests/mocks/octokit.mock';
import { GithubApiError } from '../../../errors/github-api.error';

import { GetPullRequestReviewsArgs } from './get-pull-request-reviews';

vi.mock('@octokit/core');
mockConsole({
  warn: vi.fn(),
});

describe('getPullRequestReviews effect', () => {
  const args: GetPullRequestReviewsArgs = {
    owner: 'cool',
    repo: 'yolo',
    pullNumber: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retun multiple pages data', async () => {
    const count = 25;
    const mock = await octokitMock.request({
      data: mockData,
      ...octokitRequestResponseHeaders(count),
    });

    const { getPullRequestReviews } = await import(
      './get-pull-request-reviews'
    );

    const result = await Effect.runPromise(getPullRequestReviews(args));

    expect(result).toStrictEqual(Array(count).fill(mockData).flat());
    expect(mock).toHaveBeenCalledTimes(count);
  });

  it('should only do one request', async () => {
    const mock = await octokitMock.request({
      data: mockData,
      headers: {},
    });

    const { getPullRequestReviews } = await import(
      './get-pull-request-reviews'
    );

    const result = await Effect.runPromise(getPullRequestReviews(args));

    expect(result).toStrictEqual(mockData);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('should fail when one request fails', async () => {
    await octokitMock.requestSucceedAndFail(
      new GithubApiError({ cause: 'oh no' }),
      {
        data: mockData,
        ...octokitRequestResponseHeaders(3),
      },
    );

    const { getPullRequestReviews } = await import(
      './get-pull-request-reviews'
    );

    const result = await Effect.runPromise(
      pipe(getPullRequestReviews(args), Effect.flip),
    );

    expect(result).toBeInstanceOf(GithubApiError);
  });
});
