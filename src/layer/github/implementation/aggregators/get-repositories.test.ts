import { Effect, pipe } from 'effect';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockData } from '../../../../tests/mock-data/data.mock-data';
import { octokitRequestResponseHeaders } from '../../../../tests/mock-data/octokit-request-response-headers.mock-data';
import { mockConsole } from '../../../../tests/mocks/console.mock';
import { octokitMock } from '../../../../tests/mocks/octokit.mock';
import { GithubApiError } from '../../../errors/github-api.error';

import { GetRepositoriesArgs } from './get-repositories';

vi.mock('@octokit/core');
mockConsole({
  warn: vi.fn(),
});

describe('getRepositories effect', () => {
  const args: GetRepositoriesArgs = {
    target: 'yolo',
    type: 'user',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retun user repos', async () => {
    const count = 25;
    const mock = await octokitMock.request({
      data: mockData,
      ...octokitRequestResponseHeaders(count),
    });

    const { getRepositories } = await import('./get-repositories');

    const result = await Effect.runPromise(getRepositories(args));

    expect(result).toStrictEqual(Array(count).fill(mockData).flat());
    expect(mock).toHaveBeenCalledTimes(count);
  });

  it('should retun org repos', async () => {
    const count = 25;
    const mock = await octokitMock.request({
      data: mockData,
      ...octokitRequestResponseHeaders(count),
    });

    const { getRepositories } = await import('./get-repositories');

    const result = await Effect.runPromise(
      getRepositories({ ...args, type: 'org' }),
    );

    expect(result).toStrictEqual(Array(count).fill(mockData).flat());
    expect(mock).toHaveBeenCalledTimes(count);
  });

  it('should only do one request', async () => {
    const mock = await octokitMock.request({
      data: mockData,
      headers: {},
    });

    const { getRepositories } = await import('./get-repositories');

    const result = await Effect.runPromise(getRepositories(args));

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

    const { getRepositories } = await import('./get-repositories');

    const result = await Effect.runPromise(
      pipe(getRepositories(args), Effect.flip),
    );

    expect(result).toBeInstanceOf(GithubApiError);
  });
});
