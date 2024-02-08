import { Layer } from 'effect';

import { SourcesAnalysisLayerContext } from '../layer/sources-analysis.layer';

import { getRepoPullRequests } from './implementation/aggregators/get-repo-pull-requests.effect';
import { getRepositories } from './implementation/generics/get-repositories.effect';
import { getPullRequestReviewsPage } from './implementation/primitives/get-pull-request-reviews-page.effect';
import { myOrgs } from './implementation/primitives/my-orgs.effect';
import { myProfile } from './implementation/primitives/my-profile.effect';

export const GithubSourcesAnalysisLayerLive = Layer.succeed(
  SourcesAnalysisLayerContext,
  SourcesAnalysisLayerContext.of({
    myProfile,
    myOrgs,
    getRepositories,
    getRepoPullRequests,
    getPullRequestReviewsPage,
  }),
);
