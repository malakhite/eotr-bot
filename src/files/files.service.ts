import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { isNodeException } from '../lib/type-guards';

@Injectable()
export class FilesService {
	constructor(private readonly configService: ConfigService) {}

	public async readFile(name: string) {
		const fileStore = this.configService.get('FILE_STORE_PATH');
		const fileName = join(fileStore, name);

		const file = await readFile(fileName);
		return file;
	}

	public createFileName(file: Buffer) {
		const hash = createHash('sha256');
		hash.update(file);
		return hash.digest('hex');
	}

	public async retrieveFileUrl(host: string | URL, file: Buffer) {
		const name = this.createFileName(file);
		const fileStore = this.configService.get('FILE_STORE_PATH');
		const fileName = join(fileStore, name);
		const urlPath = `files/${name}`;
		const url = new URL(urlPath, host);

		try {
			const statResult = await stat(fileName);

			if (statResult.isFile()) {
				return url;
			} else {
				throw new InternalServerErrorException(`${fileName} is not a file.`);
			}
		} catch (e) {
			if (isNodeException(e) && e.code === 'ENOENT') {
				await writeFile(fileName, file);
				return url;
			} else {
				throw e;
			}
		}
	}
}
