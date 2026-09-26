import { test, eq, fakeClock } from './harness.js';
import { createStopwatch } from '../js/logic/stopwatch.js';

test('stopwatch: elapsed runs with the clock', () => {
  const { clock, now } = fakeClock(1000);
  const sw = createStopwatch(now);
  eq(sw.elapsed(), 0, 'before start');
  sw.start(); clock.t = 3500;
  eq(sw.elapsed(), 2500);
  eq(sw.running, true);
});
test('stopwatch: stop freezes; double stop returns the same value', () => {
  const { clock, now } = fakeClock(0);
  const sw = createStopwatch(now);
  sw.start(); clock.t = 4200;
  eq(sw.stop(), 4200);
  clock.t = 9000;
  eq(sw.elapsed(), 4200);
  eq(sw.stop(), 4200);
  eq(sw.running, false);
});
test('stopwatch: stop at a past timestamp', () => {
  const { clock, now } = fakeClock(0);
  const sw = createStopwatch(now);
  sw.start(); clock.t = 10000;
  eq(sw.stop(6000), 6000);
});
test('stopwatch: stop before start is 0', () => {
  const sw = createStopwatch(() => 5);
  eq(sw.stop(), 0);
});
