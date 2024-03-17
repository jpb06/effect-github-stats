import { Layer } from 'effect';

import { OctokitLayerContext } from '../octokit.context';

import { getPullRequestReviews } from './implementation/aggregators/get-pull-request-reviews';
import { getRepoIssues } from './implementation/aggregators/get-repo-issues';
import { getRepoPullRequests } from './implementation/aggregators/get-repo-pull-requests';
import { getRepositories } from './implementation/aggregators/get-repositories';
import { getUserEvents } from './implementation/aggregators/get-user-events';
import { getIssue } from './implementation/primitives/get-issue';
import { getPullRequest } from './implementation/primitives/get-pull-request';
import { getUserOrgs } from './implementation/primitives/get-user-orgs';
import { getUserProfile } from './implementation/primitives/get-user-profile';

export const OctokitLayerLive = Layer.succeed(
  OctokitLayerContext,
  OctokitLayerContext.of({
    getUserProfile,
    getUserOrgs,
    getUserEvents,
    getRepositories,
    getRepoPullRequests,
    getRepoIssues,
    getIssue,
    getPullRequest,
    getPullRequestReviews,
  }),
);
