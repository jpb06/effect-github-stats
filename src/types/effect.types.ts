/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Effect } from 'effect';

export type EffectRequirement<
  T extends (...args: any) => Effect.Effect<unknown, unknown, unknown>,
> = Effect.Effect.Context<ReturnType<T>>;

export type EffectSuccess<
  T extends (...args: any) => Effect.Effect<unknown, unknown, unknown>,
> = Effect.Effect.Success<ReturnType<T>>;

export type EffectError<
  T extends (...args: any) => Effect.Effect<unknown, unknown, unknown>,
> = Effect.Effect.Error<ReturnType<T>>;

export type EffectWithoutRequirement<
  T extends (...args: any) => Effect.Effect<unknown, unknown, unknown>,
> = Effect.Effect<never, EffectError<T>, EffectSuccess<T>>;
