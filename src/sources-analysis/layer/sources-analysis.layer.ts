import type { ConfigError, Effect } from 'effect';
import { Context } from 'effect';

import { tapLayer } from '../../effects/tapLayer.effect';
import { GithubApiError } from '../errors/github-api.error';
import {
  RepoPullRequests,
  GetRepoPullRequestsArgs,
} from '../github/implementation/aggregators/get-repo-pull-requests.effect';
import {
  GetRepositoriesArgs,
  Repositories,
} from '../github/implementation/generics/get-repositories.effect';
import {
  GetPullRequestReviewsPageArgs,
  PullRequestReviewsPage,
} from '../github/implementation/primitives/get-pull-request-reviews-page.effect';
import { MyOrgsResult } from '../github/implementation/primitives/my-orgs.effect';
import { MyProfileResult } from '../github/implementation/primitives/my-profile.effect';

export interface SourcesAnalysis {
  readonly myProfile: Effect.Effect<
    never,
    GithubApiError | ConfigError.ConfigError,
    MyProfileResult
  >;
  readonly myOrgs: Effect.Effect<
    never,
    GithubApiError | ConfigError.ConfigError,
    MyOrgsResult
  >;
  readonly getRepositories: (
    args: GetRepositoriesArgs,
  ) => Effect.Effect<
    never,
    GithubApiError | ConfigError.ConfigError,
    Repositories
  >;
  readonly getRepoPullRequests: (
    args: GetRepoPullRequestsArgs,
  ) => Effect.Effect<
    never,
    GithubApiError | ConfigError.ConfigError,
    RepoPullRequests
  >;
  readonly getPullRequestReviewsPage: (
    args: GetPullRequestReviewsPageArgs,
  ) => Effect.Effect<
    never,
    GithubApiError | ConfigError.ConfigError,
    PullRequestReviewsPage
  >;
}

export const SourcesAnalysisLayerContext = Context.Tag<SourcesAnalysis>();

export const SourcesAnalysisLayer = {
  myProfile: tapLayer(
    SourcesAnalysisLayerContext,
    ({ myProfile }) => myProfile,
  ),
  myOrgs: tapLayer(SourcesAnalysisLayerContext, ({ myOrgs }) => myOrgs),
  getRepositories: (args: GetRepositoriesArgs) =>
    tapLayer(SourcesAnalysisLayerContext, ({ getRepositories }) =>
      getRepositories(args),
    ),
  getRepoPullRequests: (args: GetRepoPullRequestsArgs) =>
    tapLayer(SourcesAnalysisLayerContext, ({ getRepoPullRequests }) =>
      getRepoPullRequests(args),
    ),
  getPullRequestReviewsPage: (args: GetPullRequestReviewsPageArgs) =>
    tapLayer(SourcesAnalysisLayerContext, ({ getPullRequestReviewsPage }) =>
      getPullRequestReviewsPage(args),
    ),
};
