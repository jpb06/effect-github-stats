import type { ConfigError, Effect } from 'effect';
import { Context } from 'effect';

import { GithubApiError } from './errors/github-api.error';
import {
  GetPullRequestReviewsArgs,
  PullRequestReviews,
} from './github/implementation/aggregators/get-pull-request-reviews.effect';
import {
  RepoPullRequests,
  GetRepoPullRequestsArgs,
} from './github/implementation/aggregators/get-repo-pull-requests.effect';
import {
  GetRepositoriesArgs,
  Repositories,
} from './github/implementation/aggregators/get-repositories.effect';
import { UserOrgsResult } from './github/implementation/primitives/get-user-orgs.effect';
import { UserProfileResult } from './github/implementation/primitives/get-user-profile.effect';

export interface SourcesAnalysis {
  readonly getUserProfile: (
    username: string,
  ) => Effect.Effect<
    UserProfileResult,
    GithubApiError | ConfigError.ConfigError,
    never
  >;
  readonly getUserOrgs: (
    username: string,
  ) => Effect.Effect<
    UserOrgsResult,
    GithubApiError | ConfigError.ConfigError,
    never
  >;
  readonly getRepositories: (
    args: GetRepositoriesArgs,
  ) => Effect.Effect<
    Repositories,
    GithubApiError | ConfigError.ConfigError,
    never
  >;
  readonly getRepoPullRequests: (
    args: GetRepoPullRequestsArgs,
  ) => Effect.Effect<
    RepoPullRequests,
    GithubApiError | ConfigError.ConfigError,
    never
  >;
  readonly getPullRequestReviews: (
    args: GetPullRequestReviewsArgs,
  ) => Effect.Effect<
    PullRequestReviews,
    GithubApiError | ConfigError.ConfigError,
    never
  >;
}

export const SourcesAnalysisLayerContext =
  Context.GenericTag<SourcesAnalysis>('SourcesAnalysis');
