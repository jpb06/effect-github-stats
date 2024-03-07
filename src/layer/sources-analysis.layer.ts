import { tapLayer } from './effects/tapLayer.effect';
import { GetPullRequestReviewsArgs } from './github/implementation/aggregators/get-pull-request-reviews.effect';
import { GetRepoPullRequestsArgs } from './github/implementation/aggregators/get-repo-pull-requests.effect';
import { GetRepositoriesArgs } from './github/implementation/aggregators/get-repositories.effect';
import { SourcesAnalysisLayerContext } from './sources-analysis.context';

export const SourcesAnalysisLayer = {
  user: {
    profile: (username: string) =>
      tapLayer(SourcesAnalysisLayerContext, ({ getUserProfile }) =>
        getUserProfile(username),
      ),
    orgs: (username: string) =>
      tapLayer(SourcesAnalysisLayerContext, ({ getUserOrgs }) =>
        getUserOrgs(username),
      ),
  },
  repo: {
    getAll: (args: GetRepositoriesArgs) =>
      tapLayer(SourcesAnalysisLayerContext, ({ getRepositories }) =>
        getRepositories(args),
      ),
    pull: {
      getAll: (args: GetRepoPullRequestsArgs) =>
        tapLayer(SourcesAnalysisLayerContext, ({ getRepoPullRequests }) =>
          getRepoPullRequests(args),
        ),
      review: {
        getAll: (args: GetPullRequestReviewsArgs) =>
          tapLayer(SourcesAnalysisLayerContext, ({ getPullRequestReviews }) =>
            getPullRequestReviews(args),
          ),
      },
    },
  },
};
