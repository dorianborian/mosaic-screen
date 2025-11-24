export function post(name, opts = true) {
  const data = {};
  data[name] = opts;
  return fetch('/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
