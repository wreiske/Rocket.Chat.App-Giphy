import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GiphyApp } from '../Giphy';
import { GiphyResult } from '../helpers/GiphyResult';

export class GiphyCommand implements ISlashCommand {
    public command = 'giphy';
    public i18nParamsExample = 'GIPHY_Search_Term';
    public i18nDescription = 'GIPHY_Command_Description';
    public providesPreview = true;

    constructor(private readonly app: GiphyApp) { }

    public executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        // if there are no args or args[0] === 'random'
        // then get a single one

        // otherwise, fetch the results and get a random one
        // as the max amount returned will be ten
        throw new Error('Method not implemented.');
    }

    public async previewer(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<ISlashCommandPreview> {
        let gifs: Array<GiphyResult>;
        let items: Array<ISlashCommandPreviewItem>;

        try {
            gifs = await this.app.getGifGetter().search(this.app.getLogger(), http, context.getArguments().join(' '), read);
            items = gifs.map((gif) => gif.toPreviewItem());
        } catch (e) {
            this.app.getLogger().error('Failed on something:', e);
            return {
                i18nTitle: 'ERROR',
                items: new Array(),
            };
        }

        return {
            i18nTitle: 'Results for',
            items,
        };
    }

    public async executePreviewItem(item: ISlashCommandPreviewItem, context: SlashCommandContext, read: IRead,
        modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const builder = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());

        try {
            const gif = await this.app.getGifGetter().getOne(this.app.getLogger(), http, item.id, read);
            builder.addAttachment({
                title: {
                    value: gif.title,
                },
                imageUrl: gif.originalUrl,
            });

            await modify.getCreator().finish(builder);
        } catch (e) {
            this.app.getLogger().error('Failed getting a gif', e);
            builder.setText('An error occurred when trying to send the gif :disappointed_relieved:');

            modify.getNotifier().notifyUser(context.getSender(), builder.getMessage());
        }
    }
}
