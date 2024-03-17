import { Effect, pipe } from 'effect';
import { runPromise } from 'effect-errors';

import { OctokitLayer, OctokitLayerLive } from '.';

const jpb06 = OctokitLayer.user('jpb06');
const reactRepo = OctokitLayer.repo({
  owner: 'facebook',
  name: 'react',
});

(async () => {
  const r = await runPromise(
    Effect.withSpan('runPromise')(
      pipe(
        Effect.all(
          [
            OctokitLayer.org('bahouse').repos(),
            jpb06.repos(),
            reactRepo.pulls({ concurrency: 1000 }),
          ],
          {
            concurrency: 'unbounded',
          },
        ),
        Effect.provide(OctokitLayerLive),
      ),
    ),
    {
      stripCwd: true,
    },
  );

  console.info(r.flatMap((x) => x.length));
})();
