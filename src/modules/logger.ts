import Pino from 'pino';

export const log = Pino({ level: process.env.LOG_LEVEL || 'info' });
