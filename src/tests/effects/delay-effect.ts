import { Duration, Effect, Fiber, TestClock, TestContext } from 'effect';

export const delayEffect = <R, E>(
  effect: Effect.Effect<R, E>,
  duration: Duration.Duration,
) =>
  Effect.gen(function* (_) {
    const f = yield* _(effect, Effect.fork);
    yield* _(TestClock.adjust(duration));

    return yield* _(Fiber.join(f));
  }).pipe(Effect.provide(TestContext.TestContext));

export const delayEffectAndFlip = <R, E>(
  effect: Effect.Effect<R, E>,
  duration: Duration.Duration,
) => delayEffect(effect, duration).pipe(Effect.flip);
