import { Layer } from 'effect';

import { SourcesAnalysisLayerContext } from '../sources-analysis.context';

import { getPullRequestReviews } from './implementation/aggregators/get-pull-request-reviews.effect';
import { getRepoPullRequests } from './implementation/aggregators/get-repo-pull-requests.effect';
import { getRepositories } from './implementation/aggregators/get-repositories.effect';
import { getUserOrgs } from './implementation/primitives/get-user-orgs.effect';
import { getUserProfile } from './implementation/primitives/get-user-profile.effect';

export const GithubSourcesAnalysisLayerLive = Layer.succeed(
  SourcesAnalysisLayerContext,
  SourcesAnalysisLayerContext.of({
    getUserOrgs,
    getUserProfile,
    getRepositories,
    getRepoPullRequests,
    getPullRequestReviews,
  }),
);
