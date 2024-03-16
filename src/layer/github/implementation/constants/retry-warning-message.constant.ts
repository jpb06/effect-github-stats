import chalk from 'chalk';

export interface WithRequestUrl {
  request: { url: string };
}

export const retryWarningMessage = (e: unknown, retryAfter: number) =>
  chalk.hex('#FFA500')(
    `⚠️ Rate limit error on '${(e as WithRequestUrl).request.url.replace(
      'https://api.github.com',
      '',
    )}' ⏳ retrying in ${retryAfter} seconds.`,
  );
