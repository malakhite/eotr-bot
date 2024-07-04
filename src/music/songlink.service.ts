// import { HttpService } from '@nestjs/axios';
// import { Injectable, Logger } from '@nestjs/common';
// import { IMusicSearchProvider, SongServiceResponse } from './music.interface';
// import { catchError, first, firstValueFrom, map } from 'rxjs';
// import { AxiosError } from 'axios';
// import { SongLinkResponse } from './songlink.dto';

// @Injectable()
// export class SonglinkService implements IMusicSearchProvider {
//     private readonly logger = new Logger(SonglinkService.name);
//     private readonly songlinkUrl = 'https://api.song.link';
//     private readonly apiVersion = 'v1-alpha.1';

//     constructor(
//         private readonly httpService: HttpService,
//     ) {}

//     async getSongByUrl(url: string) {
//         const requestUrl = new URL('links', this.songlinkUrl);

//         const { data } = await firstValueFrom(
//             this.httpService.get<SongLinkResponse>(requestUrl.toString(), {
//                 params: {
//                     url
//                 }
//             })
//             .pipe(
//                 catchError((error: AxiosError) => {
//                     this.logger.error(error.response.data);
//                     throw error.message;
//                 }),

//             )
//         );

//         const entities = Object.values(data.entitiesByUniqueId);
//         const cover =
//     }
// }
