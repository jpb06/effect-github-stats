import { Effect, pipe } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockData } from '../../../../tests/mock-data/data.mock-data';
import { octokitRequestResponseHeaders } from '../../../../tests/mock-data/octokit-request-response-headers.mock-data';
import { mockConsole } from '../../../../tests/mocks/console.mock';
import { octokitMock } from '../../../../tests/mocks/octokit.mock';
import { GithubApiError } from '../../../errors/github-api.error';

import { GetRepoPullRequestsArgs } from './get-repo-pull-requests';

vi.mock('@octokit/core');
mockConsole({
  warn: vi.fn(),
});

describe('getRepoPullRequests effect', () => {
  const args: GetRepoPullRequestsArgs = {
    owner: 'cool',
    repo: 'yolo',
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

    const { getRepoPullRequests } = await import('./get-repo-pull-requests');

    const result = await Effect.runPromise(getRepoPullRequests(args));

    expect(result).toStrictEqual(Array(count).fill(mockData).flat());
    expect(mock).toHaveBeenCalledTimes(count);
  });

  it('should only do one request', async () => {
    const mock = await octokitMock.request({
      data: mockData,
      headers: {},
    });

    const { getRepoPullRequests } = await import('./get-repo-pull-requests');

    const result = await Effect.runPromise(getRepoPullRequests(args));

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

    const { getRepoPullRequests } = await import('./get-repo-pull-requests');

    const result = await Effect.runPromise(
      pipe(getRepoPullRequests(args), Effect.flip),
    );

    expect(result).toBeInstanceOf(GithubApiError);
  });
});
