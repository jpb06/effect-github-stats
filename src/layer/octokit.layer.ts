import { tapLayer } from './effects/tapLayer.effect';
import { defaultConcurrency } from './github/implementation/constants/default-concurrency.constant';
import { defaultRetryCount } from './github/implementation/constants/default-retry-count.constant';
import { OctokitLayerContext as Context } from './octokit.context';
import { FlowOptions } from './types/flow-options.type';

const flowOptionsDefault: FlowOptions = {
  concurrency: defaultConcurrency,
  retryCount: defaultRetryCount,
};

export interface RepoArgs {
  owner: string;
  name: string;
}

export const OctokitLayer = {
  user: (username: string) => ({
    profile: (options: FlowOptions = flowOptionsDefault) =>
      tapLayer(Context, ({ getUserProfile }) =>
        getUserProfile({ username, ...options }),
      ),
    orgs: (options: FlowOptions = flowOptionsDefault) =>
      tapLayer(Context, ({ getUserOrgs }) =>
        getUserOrgs({ username, ...options }),
      ),
    events: (options: FlowOptions = flowOptionsDefault) =>
      tapLayer(Context, ({ getUserEvents }) =>
        getUserEvents({ username, ...options }),
      ),
    repos: (options: FlowOptions = flowOptionsDefault) =>
      tapLayer(Context, ({ getRepositories }) =>
        getRepositories({ target: username, type: 'user', ...options }),
      ),
  }),
  org: (owner: string) => ({
    repos: (options: FlowOptions = flowOptionsDefault) =>
      tapLayer(Context, ({ getRepositories }) =>
        getRepositories({ target: owner, type: 'org', ...options }),
      ),
  }),
  repo: ({ owner, name }: RepoArgs) => ({
    issues: (options: FlowOptions = flowOptionsDefault) =>
      tapLayer(Context, ({ getRepoIssues }) =>
        getRepoIssues({ owner, repo: name, ...options }),
      ),
    issue: (number: number) =>
      tapLayer(Context, ({ getIssue }) =>
        getIssue({ owner, repo: name, number }),
      ),
    pulls: (options: FlowOptions = flowOptionsDefault) =>
      tapLayer(Context, ({ getRepoPullRequests }) =>
        getRepoPullRequests({ owner, repo: name, ...options }),
      ),
    pull: (number: number) => ({
      details: (options: FlowOptions = flowOptionsDefault) =>
        tapLayer(Context, ({ getPullRequest }) =>
          getPullRequest({ owner, repo: name, number, ...options }),
        ),
      reviews: (options: FlowOptions = flowOptionsDefault) =>
        tapLayer(Context, ({ getPullRequestReviews }) =>
          getPullRequestReviews({
            owner,
            repo: name,
            pullNumber: number,
            ...options,
          }),
        ),
    }),
  }),
};

OctokitLayer.repo({ owner: 'jpb06', name: 'effect' }).pull(1).reviews();
