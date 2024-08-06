import { INestApplicationContext } from '@nestjs/common';
import { ConfigurableOperationInput } from '@vendure/common/lib/generated-types';
import { Channel, ChannelService, CollectionDefinition, CountryDefinition, FacetService, ImportProgress, Importer, LanguageCode, Logger, Populator, RequestContextService, RoleDefinition, TransactionalConnection, User, VendureWorker } from '@vendure/core';
import { config } from '../config/vendure-config';
import fs from 'fs-extra';
import path from 'path';
import { lastValueFrom } from 'rxjs';

const loggerCtx = 'Populate';

export interface InitialData {
    defaultLanguage: LanguageCode;
    defaultZone: string;
    roles?: RoleDefinition[];
    countries: CountryDefinition[];
    taxRates: Array<{
        name: string;
        percentage: number;
    }>;
    shippingMethods: Array<{
        name: string;
        price: number;
    }>;
    paymentMethods: Array<{
        name: string;
        handler: ConfigurableOperationInput;
    }>;
    collections: CollectionDefinition[];
    facets: {
        name: string;
        code: string;
        values: {
            name: string;
            code: string;
        }[];
    }[]
}

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

        await populateCollections(app, initialData, channel);
        await populateFacet(app, initialData, channel);
    }

    Logger.info('Done!', loggerCtx);
    return app;
}

export async function populateInitialData(
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

export async function populateCollections(
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

export async function importProductsFromCsv(
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

export async function populateFacet(
    app: INestApplicationContext,
    initialData: InitialData,
    channel?: Channel,
) {
    const superAdminUser = await app.get(TransactionalConnection).rawConnection.getRepository(User).findOne({
        where: {
            identifier: config.authOptions.superadminCredentials?.identifier,
        },
    });

    const ctx = await app.get(RequestContextService).create({
        user: superAdminUser ?? undefined,
        apiType: 'admin',
        languageCode: initialData.defaultLanguage,
        channelOrToken: channel ?? (await app.get(ChannelService).getDefaultChannel()),
    });

    try {
        const facet = app.get(FacetService);
        initialData.facets.forEach((f) => {
            const values = f.values.map((v) => {
                return {
                    code: v.code,
                    translations: [
                        {
                            languageCode: LanguageCode.en,
                            name: v.name,
                        },
                    ],
                }
            })
            const facetData = {
                code: f.code,
                translations: [
                    {
                        languageCode: LanguageCode.en,
                        name: f.name,
                    },
                ],
                isPrivate: false,
                values: values,
            }
            facet.create(ctx, facetData);
        });
        Logger.info(`Created ${initialData.facets.length} Facets`, loggerCtx);
    } catch (err: any) {
        Logger.info(err.message, loggerCtx);
    }
}