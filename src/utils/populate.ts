import { INestApplicationContext } from '@nestjs/common';
import { Channel, ChannelService, FacetService, FacetValueService, ImportProgress, Importer, LanguageCode, Logger, Populator, RequestContextService, SearchService, VendureWorker } from '@vendure/core';
import fs from 'fs-extra';
import path from 'path';
import { lastValueFrom } from 'rxjs';
import { InitialData } from './types';

const loggerCtx = 'Populate';

export async function populate(
    bootstrapFn: () => Promise<VendureWorker>,
    initialDataPathOrObject: string | object,
    productsCsvPath?: string,
    channelOrToken?: string | Channel,
): Promise<INestApplicationContext> {
    const { app } = await bootstrapFn();
    if (!app) {
        throw new Error('Could not bootstrap the Vendure app');
    }
    let channel: Channel | undefined;

    if (typeof channelOrToken === 'string') {
        channel = await app.get(ChannelService).getChannelFromToken(channelOrToken);
        if (!channel) {
            Logger.warn(
                `Warning: channel with token "${channelOrToken}" was not found. Using default Channel instead.`,
                loggerCtx,
            );
        }
    } else if (channelOrToken instanceof Channel) {
        channel = channelOrToken;
    }
    const initialData: InitialData =
        typeof initialDataPathOrObject === 'string'
            ? require(initialDataPathOrObject)
            : initialDataPathOrObject;

    await populateInitialData(app, initialData, channel);

    if (productsCsvPath) {
        const importResult = await importProductsFromCsv(
            app,
            productsCsvPath,
            initialData.defaultLanguage,
            channel,
        );
        if (importResult.errors && importResult.errors.length) {
            const errorFile = path.join(process.cwd(), 'vendure-import-error.log');
            Logger.error(
                `${importResult.errors.length} errors encountered when importing product data. See: ${errorFile}`,
                loggerCtx,
            );
            await fs.writeFile(errorFile, importResult.errors.join('\n'));
        }

        Logger.info(`Imported ${importResult.imported} products`, loggerCtx);

        await populateFacet(app, initialData, channel);
        await populateCollections(app, initialData, channel);

    }

    Logger.info('Done!', loggerCtx);
    return app;
}

async function populateInitialData(
    app: INestApplicationContext,
    initialData: InitialData,
    channel?: Channel,
) {

    const populator = app.get(Populator);
    try {
        await populator.populateInitialData(initialData, channel);
        Logger.info('Populated initial data', loggerCtx);
    } catch (err: any) {
        Logger.error(err.message, loggerCtx);
    }
}

async function populateCollections(
    app: INestApplicationContext,
    initialData: InitialData,
    channel?: Channel,
) {

    const populator = app.get(Populator);
    try {
        if (initialData.collections.length) {
            await populator.populateCollections(initialData, channel);
            Logger.info(`Created ${initialData.collections.length} Collections`, loggerCtx);
        }
    } catch (err: any) {
        Logger.info(err.message, loggerCtx);
    }
}

async function importProductsFromCsv(
    app: INestApplicationContext,
    productsCsvPath: string,
    languageCode: LanguageCode,
    channel?: Channel,
): Promise<ImportProgress> {

    const importer = app.get(Importer);
    const requestContextService = app.get(RequestContextService);
    const productData = await fs.readFile(productsCsvPath, 'utf-8');
    const ctx = await requestContextService.create({
        apiType: 'admin',
        languageCode,
        channelOrToken: channel,
    });
    return lastValueFrom(importer.parseAndImport(productData, ctx, true));
}

async function populateFacet(
    app: INestApplicationContext,
    initialData: InitialData,
    channel?: Channel,
) {

    const ctx = await app.get(RequestContextService).create({
        apiType: 'admin',
        languageCode: initialData.defaultLanguage,
    });

    try {
        const facetService = app.get(FacetService);
        const facetValueService = app.get(FacetValueService);
        for (const facetDef of initialData.facets) {
            const facetData = {
                code: facetDef.code,
                translations: [
                    {
                        languageCode: LanguageCode.en,
                        name: facetDef.name,
                    },
                ],
                isPrivate: false,
            }

            const facet = await facetService.create(ctx, facetData);
            if (facetDef.values && facetDef.values.length) {
                for (const value of facetDef.values) {
                    await facetValueService.create(ctx, facet, {
                        facetId: facet.id,
                        code: value.code,
                        translations: [
                            {
                                languageCode: LanguageCode.en,
                                name: value.name,
                            },
                        ],
                    })

                }
            }

        }

        await new Promise(resolve => setTimeout(resolve, 50));
        await app.get(SearchService).reindex(ctx);

        Logger.info(`Created ${initialData.facets.length} Facets`, loggerCtx);
    } catch (err: any) {
        Logger.info(err.message, loggerCtx);
    }
}
