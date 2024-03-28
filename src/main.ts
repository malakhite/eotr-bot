import { LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json } from 'body-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app/app.module';

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
		bufferLogs: true,
		logger,
	});

	const configService = app.get(ConfigService);
	app.useLogger(app.get(Logger));

	const eventSubPath = configService.get('TWITCH_EVENTSUB_PATH');
	const port = configService.get('PORT');

	app.use((req: Request, res: Response, next: NextFunction) => {
		if (req.path.includes(eventSubPath)) {
			next();
		} else {
			json()(req, res, next);
		}
	});
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalInterceptors(new LoggerErrorInterceptor());

	await app.listen(port);
}

bootstrap();
