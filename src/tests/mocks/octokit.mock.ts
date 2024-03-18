/* eslint-disable @typescript-eslint/no-explicit-any */
import { Octokit } from '@octokit/core';
import { RequestInterface } from '@octokit/types';
import { vi } from 'vitest';

export const octokitMock = {
  requestOnce: async (data: unknown) => {
    const requestMock = vi.fn();

    vi.mocked(Octokit).mockImplementationOnce(
      () =>
        ({
          request: requestMock.mockResolvedValueOnce(
            data,
          ) as unknown as RequestInterface<object>,
        }) as Octokit,
    );

    return requestMock;
  },
  request: async (data: unknown) => {
    const requestMock = vi.fn();

    vi.mocked(Octokit).mockImplementation(
      () =>
        ({
          request: requestMock.mockResolvedValueOnce(
            data,
          ) as unknown as RequestInterface<object>,
        }) as Octokit,
    );

    return requestMock;
  },
  requestFail: async (error: any) => {
    const requestMock = vi.fn();

    vi.mocked(Octokit).mockImplementation(
      () =>
        ({
          request: requestMock.mockRejectedValue(
            error,
          ) as unknown as RequestInterface<object>,
        }) as Octokit,
    );

    return requestMock;
  },
  requestSucceedAndFail: async (error: any, data: unknown) => {
    const requestMock = vi.fn();

    vi.mocked(Octokit).mockImplementation(
      () =>
        ({
          request: requestMock
            .mockResolvedValueOnce(data)
            .mockRejectedValueOnce(
              error,
            ) as unknown as RequestInterface<object>,
        }) as Octokit,
    );

    return requestMock;
  },
  requestFailAndThenSucceed: async (error: any, data: unknown) => {
    const requestMock = vi.fn();

    vi.mocked(Octokit).mockImplementation(
      () =>
        ({
          request: requestMock
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce(data) as unknown as RequestInterface<object>,
        }) as Octokit,
    );

    return requestMock;
  },
};
