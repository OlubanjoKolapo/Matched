'use client';

import { useSyncExternalStore } from 'react';

const formatter = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

const subscribe = () => () => {};

/** Today's date in the viewer's timezone. Renders nothing on the server. */
export function TodayDate() {
  const label = useSyncExternalStore(
    subscribe,
    () => formatter.format(new Date()),
    () => '',
  );
  return <span>{label || ' '}</span>;
}
