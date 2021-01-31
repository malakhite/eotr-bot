import Pino from 'pino';
import { Client } from 'discord.js';

import { log } from './logger';

export default function handleExit(signal: string, client: Client) {
  Pino.final(log, (signal, finalLogger) => {
    finalLogger.info({ type: 'info', message: 'Disconnecting' });
    client.destroy();
    finalLogger.info({
      type: 'info',
      message: `Exiting with signal: ${signal}`,
    });
    process.exit();
  });
}
