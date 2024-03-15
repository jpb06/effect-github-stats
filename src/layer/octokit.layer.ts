import { tapLayer } from './effects/tapLayer.effect';
import { defaultConcurrency } from './github/implementation/constants/default-concurrency.constant';
import { OctokitLayerContext as Context } from './octokit.context';

const concurrencyDefault = { concurrency: defaultConcurrency };

export const OctokitLayer = {
  user: (username: string) => ({
    profile: tapLayer(Context, ({ getUserProfile }) =>
      getUserProfile(username),
    ),
    orgs: tapLayer(Context, ({ getUserOrgs }) => getUserOrgs(username)),
    events: ({ concurrency } = concurrencyDefault) =>
      tapLayer(Context, ({ getUserEvents }) =>
        getUserEvents({ username, concurrency }),
      ),
    repos: ({ concurrency } = concurrencyDefault) =>
      tapLayer(Context, ({ getRepositories }) =>
        getRepositories({ concurrency, target: username, type: 'user' }),
      ),
  }),
  org: (owner: string) => ({
    repos: ({ concurrency } = concurrencyDefault) =>
      tapLayer(Context, ({ getRepositories }) =>
        getRepositories({ concurrency, target: owner, type: 'org' }),
      ),
  }),
  repo: ({ owner, name }: { owner: string; name: string }) => ({
    issues: ({ concurrency } = concurrencyDefault) =>
      tapLayer(Context, ({ getRepoIssues }) =>
        getRepoIssues({ concurrency, owner, repo: name }),
      ),
    issue: (number: number) =>
      tapLayer(Context, ({ getIssue }) =>
        getIssue({ owner, repo: name, number }),
      ),
    pulls: ({ concurrency } = concurrencyDefault) =>
      tapLayer(Context, ({ getRepoPullRequests }) =>
        getRepoPullRequests({ concurrency, owner, repo: name }),
      ),
    pull: (number: number) => ({
      reviews: ({ concurrency } = concurrencyDefault) =>
        tapLayer(Context, ({ getPullRequestReviews }) =>
          getPullRequestReviews({
            concurrency,
            owner,
            repo: name,
            pullNumber: number,
          }),
        ),
    }),
  }),
};

OctokitLayer.repo({ owner: 'jpb06', name: 'effect' }).pull(1).reviews();
