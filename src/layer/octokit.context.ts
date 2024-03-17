import type { ConfigError, Effect } from 'effect';
import { Context } from 'effect';

import { ApiRateLimitError } from './errors/api-rate-limit.error';
import { GithubApiError } from './errors/github-api.error';
import {
  GetPullRequestReviewsArgs,
  PullRequestReviewsResult,
} from './github/implementation/aggregators/get-pull-request-reviews';
import { RepoIssuesResult } from './github/implementation/aggregators/get-repo-issues';
import {
  RepoPullRequestsResult,
  GetRepoPullRequestsArgs,
} from './github/implementation/aggregators/get-repo-pull-requests';
import {
  GetRepositoriesArgs,
  RepositoriesResult,
} from './github/implementation/aggregators/get-repositories';
import {
  GetUserEventsArgs,
  UserEventsResult,
} from './github/implementation/aggregators/get-user-events';
import {
  GetIssueArgs,
  IssueResult,
} from './github/implementation/primitives/get-issue';
import {
  GetPullRequestArgs,
  PullRequestResult,
} from './github/implementation/primitives/get-pull-request';
import {
  GetUserOrgsArgs,
  UserOrgsResult,
} from './github/implementation/primitives/get-user-orgs';
import {
  GetUserProfileArgs,
  UserProfileResult,
} from './github/implementation/primitives/get-user-profile';

export interface Octokit {
  readonly getUserProfile: (
    args: GetUserProfileArgs,
  ) => Effect.Effect<
    UserProfileResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
  readonly getUserOrgs: (
    args: GetUserOrgsArgs,
  ) => Effect.Effect<
    UserOrgsResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
  readonly getUserEvents: (
    args: GetUserEventsArgs,
  ) => Effect.Effect<
    UserEventsResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
  readonly getRepositories: (
    args: GetRepositoriesArgs,
  ) => Effect.Effect<
    RepositoriesResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
  readonly getRepoPullRequests: (
    args: GetRepoPullRequestsArgs,
  ) => Effect.Effect<
    RepoPullRequestsResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
  readonly getRepoIssues: (
    args: GetRepoPullRequestsArgs,
  ) => Effect.Effect<
    RepoIssuesResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
  readonly getIssue: (
    args: GetIssueArgs,
  ) => Effect.Effect<
    IssueResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
  readonly getPullRequest: (
    args: GetPullRequestArgs,
  ) => Effect.Effect<
    PullRequestResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
  readonly getPullRequestReviews: (
    args: GetPullRequestReviewsArgs,
  ) => Effect.Effect<
    PullRequestReviewsResult,
    GithubApiError | ApiRateLimitError | ConfigError.ConfigError,
    never
  >;
}

export const OctokitLayerContext = Context.GenericTag<Octokit>('Octokit');
