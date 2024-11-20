import { api } from 'encore.dev/api';

export const frontend = api.static({
  expose: true,
  path: '/!path',
  dir: './dist',
});
