import { LanguageCode, PluginCommonModule, VendurePlugin } from '@vendure/core';

@VendurePlugin({
    imports: [PluginCommonModule],
    configuration: config => {
        config.customFields.Customer.push({
            type: 'string',
            name: 'avatarUrl',
            label: [{ languageCode: LanguageCode.en, value: 'Avatar URL' }],
            list: true,
        });
        return config;
    },
})
export class AvatarPlugin { }