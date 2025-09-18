export const api = {
  get: (url: string) => fetch(url, { credentials: 'include' }).then(r => r.json()),
  post: (url: string, body: any) => fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), credentials: 'include'
  }).then(r => r.json()),
};
