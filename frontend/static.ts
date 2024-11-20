import { api } from 'encore.dev/api';

export const salesDashboard = api.static({
  expose: true,
  path: '/!path',
  dir: './dist',
});
