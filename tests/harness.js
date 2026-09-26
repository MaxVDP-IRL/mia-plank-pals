const tests = [];
export function test(name, fn) { tests.push({ name, fn }); }
export function eq(actual, expected, msg = '') {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg}\n  expected: ${b}\n  actual:   ${a}`);
}
export function ok(cond, msg = 'expected truthy') { if (!cond) throw new Error(msg); }
export async function run() {
  const list = document.getElementById('results');
  let pass = 0, fail = 0;
  for (const t of tests) {
    const li = document.createElement('li');
    try { await t.fn(); pass++; li.className = 'ok'; li.textContent = '✔ ' + t.name; }
    catch (e) { fail++; li.className = 'bad'; li.textContent = '✘ ' + t.name;
      const pre = document.createElement('pre'); pre.textContent = e.message; li.appendChild(pre); console.error(t.name, e); }
    list.appendChild(li);
  }
  const s = document.getElementById('summary');
  s.textContent = fail ? `${fail} FAILED, ${pass} passed` : `All ${pass} tests passed`;
  s.className = fail ? 'bad' : 'ok';
  document.title = (fail ? '✘ ' : '✔ ') + document.title;
  window.__testResult = { pass, fail };
}

// Shared helpers
export function fakeClock(t0 = 0) { const clock = { t: t0 }; return { clock, now: () => clock.t }; }
export function seqRng(values) { let i = 0; return () => values[i++ % values.length]; }
