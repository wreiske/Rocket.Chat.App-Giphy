import { HttpStatusCode, IHttp, ILogger, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { GiphyResult } from '../helpers/GiphyResult';

export class GifGetter {
    private readonly url = 'https://api.giphy.com/v1/gifs/';
    private readonly defaultKey = 'kICM0DRhpfvIcGLhtmCjqEigApnPMLXf';

    public async search(logger: ILogger, http: IHttp, phase: string, read: IRead): Promise<Array<GiphyResult>> {
        // TODO: Maybe error out when they don't provide us with something?
        let search = phase.trim();
        if (!search) {
            search = 'random';
        }

        const key = await read.getEnvironmentReader().getSettings().getValueById('giphy_apikey') || this.defaultKey;
        const langCode = await read.getEnvironmentReader().getSettings().getValueById('giphy_lang_code') || 'en';
        const rating = await read.getEnvironmentReader().getSettings().getValueById('giphy_rating') || 'g';
        const response = await http.get(`${this.url}search?api_key=${key}&q=${search}&limit=10&lang=${langCode}&rating=${rating}`);

        if (response.statusCode !== HttpStatusCode.OK || !response.data || !response.data.data) {
            logger.debug('Did not get a valid response', response);
            throw new Error('Unable to retrieve gifs.');
        } else if (!Array.isArray(response.data.data)) {
            logger.debug('The response data is not an Array:', response.data.data);
            throw new Error('Data is in a format we don\'t understand.');
        }

        // logger.debug('We got this many results:', response.data.data.length);
        return response.data.data.map((r) => new GiphyResult(r));
    }

    public async getOne(logger: ILogger, http: IHttp, gifId: string, read: IRead): Promise<GiphyResult> {
        const key = await read.getEnvironmentReader().getSettings().getValueById('giphy_apikey') || this.defaultKey;
        const response = await http.get(`${this.url}${gifId}?api_key=${key}`);

        if (response.statusCode !== HttpStatusCode.OK || !response.data || !response.data.data) {
            logger.debug('Did not get a valid response', response);
            throw new Error('Unable to retrieve the gif.');
        } else if (typeof response.data.data !== 'object') {
            logger.debug('The response data is not an Object:', response.data.data);
            throw new Error('Data is in a format we don\'t understand.');
        }

        // logger.debug('The returned data:', response.data.data);
        return new GiphyResult(response.data.data);
    }
}
