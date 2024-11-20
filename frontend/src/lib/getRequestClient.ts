import Client, { Local } from './client.ts';

const getRequestClient = () => {
  const isLocal =
    location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const env = isLocal ? Local : window.location.origin;

  return new Client(env);
};

export default getRequestClient;
