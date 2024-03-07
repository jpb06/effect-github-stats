/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Effect } from 'effect';

export type EffectResultRequirement<
  T extends (...args: any) => Effect.Effect<unknown, unknown, unknown>,
> = Effect.Effect.Context<ReturnType<T>>;

export type EffectResultSuccess<
  T extends (...args: any) => Effect.Effect<unknown, unknown, unknown>,
> = Effect.Effect.Success<ReturnType<T>>;

export type EffectResultError<
  T extends (...args: any) => Effect.Effect<unknown, unknown, unknown>,
> = Effect.Effect.Error<ReturnType<T>>;

export type EffectResultWithoutRequirement<
  T extends (...args: any) => Effect.Effect<unknown, unknown, unknown>,
> = Effect.Effect<EffectResultSuccess<T>, EffectResultError<T>, never>;
