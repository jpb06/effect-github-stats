/* eslint-disable @typescript-eslint/no-explicit-any */
import { Octokit } from '@octokit/core';
import { RequestInterface } from '@octokit/types';
import { vi } from 'vitest';

export const octokitMock = {
  requestOnce: async (data: unknown) => {
    vi.mocked(Octokit).mockImplementationOnce(
      () =>
        ({
          request: vi
            .fn()
            .mockResolvedValueOnce(data) as unknown as RequestInterface<object>,
        }) as Octokit,
    );
  },
  request: async (data: unknown) => {
    vi.mocked(Octokit).mockImplementation(
      () =>
        ({
          request: vi
            .fn()
            .mockResolvedValueOnce(data) as unknown as RequestInterface<object>,
        }) as Octokit,
    );
  },
  requestFail: async (error: any) => {
    vi.mocked(Octokit).mockImplementation(
      () =>
        ({
          request: vi
            .fn()
            .mockRejectedValue(error) as unknown as RequestInterface<object>,
        }) as Octokit,
    );
  },
  requestFailAndThenSucceed: async (error: any, data: unknown) => {
    vi.mocked(Octokit).mockImplementation(
      () =>
        ({
          request: vi
            .fn()
            .mockRejectedValueOnce(error)
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce(data) as unknown as RequestInterface<object>,
        }) as Octokit,
    );
  },
};
