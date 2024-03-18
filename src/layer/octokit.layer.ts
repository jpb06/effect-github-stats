import { tapLayer } from './effects/tapLayer.effect';
import { defaultConcurrency } from './github/implementation/constants/default-concurrency.constant';
import { OctokitLayerContext as Context } from './octokit.context';

export interface RepoArgs {
  owner: string;
  name: string;
}

export const OctokitLayer = {
  user: (username: string) => ({
    profile: () =>
      tapLayer(Context, ({ getUserProfile }) => getUserProfile(username)),
    orgs: () => tapLayer(Context, ({ getUserOrgs }) => getUserOrgs(username)),
    events: (concurrency = defaultConcurrency) =>
      tapLayer(Context, ({ getUserEvents }) =>
        getUserEvents({ username, concurrency }),
      ),
    repos: (concurrency = defaultConcurrency) =>
      tapLayer(Context, ({ getRepositories }) =>
        getRepositories({ target: username, type: 'user', concurrency }),
      ),
  }),
  org: (owner: string) => ({
    repos: (concurrency = defaultConcurrency) =>
      tapLayer(Context, ({ getRepositories }) =>
        getRepositories({ target: owner, type: 'org', concurrency }),
      ),
  }),
  repo: ({ owner, name }: RepoArgs) => ({
    issues: (concurrency = defaultConcurrency) =>
      tapLayer(Context, ({ getRepoIssues }) =>
        getRepoIssues({ owner, repo: name, concurrency }),
      ),
    issue: (number: number) =>
      tapLayer(Context, ({ getIssue }) =>
        getIssue({ owner, repo: name, number }),
      ),
    pulls: (concurrency = defaultConcurrency) =>
      tapLayer(Context, ({ getRepoPullRequests }) =>
        getRepoPullRequests({ owner, repo: name, concurrency }),
      ),
    pull: (number: number) => ({
      details: () =>
        tapLayer(Context, ({ getPullRequest }) =>
          getPullRequest({ owner, repo: name, number }),
        ),
      reviews: (concurrency = defaultConcurrency) =>
        tapLayer(Context, ({ getPullRequestReviews }) =>
          getPullRequestReviews({
            owner,
            repo: name,
            pullNumber: number,
            concurrency,
          }),
        ),
    }),
  }),
};

OctokitLayer.repo({ owner: 'jpb06', name: 'effect' }).pull(1).reviews();
