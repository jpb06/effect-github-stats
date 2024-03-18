import { expect } from 'vitest';

import {
  WithRequestUrl,
  retryWarningMessage,
} from '../../layer/github/implementation/constants/retry-warning-message.constant';

export const expectApiRateLimitMessages = (
  error: WithRequestUrl,
  retryDelay: number,
) => {
  expect(console.warn).toHaveBeenCalledTimes(2);
  expect(console.warn).toHaveBeenNthCalledWith(
    1,
    retryWarningMessage(error, retryDelay),
  );
  expect(console.warn).toHaveBeenNthCalledWith(
    2,
    retryWarningMessage(error, retryDelay),
  );
};
