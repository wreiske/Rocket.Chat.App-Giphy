import {
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { GiphyCommand } from './commands/GiphyCommand';
import { GifGetter } from './helpers/GifGetter';

export class GiphyApp extends App {
    private gifGetter: GifGetter;

    constructor(info: IAppInfo, logger: ILogger) {
        super(info, logger);

        this.gifGetter = new GifGetter();
    }

    public getGifGetter(): GifGetter {
        return this.gifGetter;
    }

    protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
        await configuration.settings.provideSetting({
            id: 'giphy_apikey',
            type: SettingType.STRING,
            packageValue: 'kICM0DRhpfvIcGLhtmCjqEigApnPMLXf',
            required: true,
            public: false,
            i18nLabel: 'Customize_GIPHY_APIKey',
            i18nDescription: 'Customize_GIPHY_APIKey_Description',
        });
        await configuration.slashCommands.provideSlashCommand(new GiphyCommand(this));
    }
}
