// Tests for the radiometric-dating pure functions in ../src/app.js.
// app.js runs DOM-touching IIFEs at import time; each guards with
// `if (!cv) return`, so a minimal document stub (getElementById -> null)
// lets the module import in plain node with no side effects.
import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = { devicePixelRatio: 1, addEventListener() {} };
globalThis.document = { getElementById: () => null, body: {} };

const { fracRemaining, ageFromFraction } = await import('../src/app.js');

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} ≈ ${b}`);

test('fraction at t = T is 1/2', () => {
  const T = 5730;
  close(fracRemaining(T, T), 0.5);
});

test('fraction at t = 2T is 1/4', () => {
  const T = 5730;
  close(fracRemaining(2 * T, T), 0.25);
});

test('fraction at t = 3T is 1/8', () => {
  const T = 1.25e9;
  close(fracRemaining(3 * T, T), 0.125);
});

test('C-14 fraction after 11,460 yr (= 2 half-lives) is 1/4', () => {
  const T = 5730;
  close(fracRemaining(11460, T), 0.25);
});

test('fraction at t = 0 is 1', () => {
  close(fracRemaining(0, 4.47e9), 1);
});

test('ageFromFraction inverts fracRemaining', () => {
  const T = 5730;
  // a quarter remaining -> exactly 2 half-lives -> 11,460 yr
  close(ageFromFraction(0.25, T), 11460);
  close(ageFromFraction(0.5, T), 5730);
  // round-trip for an arbitrary age
  const t = 3.2 * T;
  close(ageFromFraction(fracRemaining(t, T), T), t, 1e-6);
});

test('U-238 ~1 half-life ≈ Earth age scale (4.47 Gyr -> 1/2)', () => {
  const T = 4.47e9;
  close(fracRemaining(T, T), 0.5);
});
