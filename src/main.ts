import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'body-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app/app.module';

import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		bodyParser: false,
		bufferLogs: true,
	});
	app.disable('x-powered-by');

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
