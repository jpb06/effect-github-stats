import { Effect } from 'effect';

import { EventsPageItems, getEventsPage } from './get-events-page.effect';

export const myEvents = Effect.gen(function* (_) {
  const r = yield* _(getEventsPage(1));
  const r1 = yield* _(getEventsPage(2));
  const r2 = yield* _(getEventsPage(3));

  console.log(r.headers.link);
  return [...r.data, ...r1.data, ...r2.data];
  // let page = 1;
  // const allEvents: EventsPageItems = [];

  // do {
  //   const events = yield* _(getEventsPage(page));
  //   allEvents.push(...events.data);
  //   page++;

  // } while (allEvents.length % 100 < 100);

  // return allEvents;
});
