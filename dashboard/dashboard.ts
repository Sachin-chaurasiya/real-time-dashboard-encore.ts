import { api, StreamInOut } from 'encore.dev/api';
import log from 'encore.dev/log';

// Map to hold all connected streams
const connectedStreams: Map<string, StreamInOut<Sale, Sale>> = new Map();

interface HandshakeRequest {
  id: string;
}

interface Sale {
  sale: string;
  total: number;
  date: string;
}

export const sale = api.streamInOut<HandshakeRequest, Sale, Sale>(
  { expose: true, auth: false, path: '/sale' },
  async (handshake, stream) => {
    connectedStreams.set(handshake.id, stream);
    log.info('user connected', handshake);

    try {
      // The stream object is an AsyncIterator that yields incoming messages.
      // The loop will continue as long as the client keeps the connection open.
      for await (const sale of stream) {
        for (const [key, val] of connectedStreams) {
          try {
            // Send the users message to all connected clients.
            await val.send({ ...sale });
          } catch (err) {
            // If there is an error sending the message, remove the client from the map.
            connectedStreams.delete(key);
            log.error('error sending', err);
          }
        }
      }
    } catch (err) {
      // If there is an error reading from the stream, remove the client from the map.
      connectedStreams.delete(handshake.id);
      log.error('stream error', err);
    }

    // When the client disconnects, remove them from the map.
    connectedStreams.delete(handshake.id);
  }
);
