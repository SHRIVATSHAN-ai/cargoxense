import { io } from 'socket.io-client';

// Same dev-vs-prod split as lib/api.ts: a separate origin locally, same
// origin (the page's own host) once the server is serving the built client.
export const socket = import.meta.env.DEV
  ? io('http://localhost:4000', { autoConnect: true })
  : io({ autoConnect: true });
