import { Effect } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockData } from '../../../../tests/mock-data/data.mock-data';
import { octokitRequestResponseHeaders } from '../../../../tests/mock-data/octokit-request-response-headers.mock-data';
import { mockConsole } from '../../../../tests/mocks/console.mock';
import { octokitMock } from '../../../../tests/mocks/octokit.mock';

import { GetPullRequestReviewsArgs } from './get-pull-request-reviews';

vi.mock('@octokit/core');
mockConsole({
  warn: vi.fn(),
});

describe('getOrgReposPage effect', () => {
  const args: GetPullRequestReviewsArgs = {
    owner: 'cool',
    repo: 'yolo',
    pullNumber: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retun multiple pages data', async () => {
    await octokitMock.request({
      data: mockData,
      ...octokitRequestResponseHeaders(25),
    });

    const { getPullRequestReviews } = await import(
      './get-pull-request-reviews'
    );

    const result = await Effect.runPromise(getPullRequestReviews(args));

    expect(result).toStrictEqual(Array(25).fill(mockData).flat());
  });
});
