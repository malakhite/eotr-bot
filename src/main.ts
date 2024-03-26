import { LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { json } from 'body-parser';

import { AppModule } from './app/app.module';
import { APP_START_EVENT } from './constants';

import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
	const logger: LogLevel[] = ['fatal', 'error', 'warn', 'log'];
	if (
		process.env.LOG_LEVEL === 'debug' ||
		process.env.LOG_LEVEL === 'verbose'
	) {
		logger.push('debug');
	}
	if (process.env.LOG_LEVEL === 'verbose') {
		logger.push('verbose');
	}

	const app = await NestFactory.create(AppModule, {
		bodyParser: false,
		logger,
	});

	const configService = app.get(ConfigService);
	const eventSubPath = configService.get('TWITCH_EVENTSUB_PATH');

	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.path.includes(eventSubPath)) {
			next();
		} else {
			json()(req, res, next);
		}
	});
	app.useGlobalPipes(new ValidationPipe());

	await app.listen(3000);

	const eventEmitter = app.get(EventEmitter2);
	eventEmitter.emit(APP_START_EVENT);
}

bootstrap();
