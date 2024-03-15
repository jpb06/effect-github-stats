import { pipe, Schedule, Effect, Duration } from 'effect';

import { isApiRateLimitError } from '../errors/api-rate-limit.error';

export const retryAfterSchedule = (retryCount: number) =>
  pipe(
    Schedule.forever,
    Schedule.whileOutput((retries) => retries <= retryCount),
    Schedule.whileInputEffect((e) => {
      const isApiRateLimit = isApiRateLimitError(e);
      if (isApiRateLimit) {
        return Effect.delay(Duration.seconds(+e.retryAfter))(
          Effect.succeed(true),
        );
      }

      return Effect.succeed(false);
    }),
  );
