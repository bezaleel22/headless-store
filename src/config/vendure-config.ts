import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  VendureConfig,
  Asset,
} from "@vendure/core";

import { defaultEmailHandlers, EmailPlugin } from "@vendure/email-plugin";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { compileUiExtensions, setBranding } from "@vendure/ui-devkit/compiler";
import "dotenv/config";
import path from "path";
import { PromotionPlugin } from "../plugins/promotion/promotion.plugin";

const IS_DEV = process.env.APP_ENV === "dev";

export const config: VendureConfig = {
  apiOptions: {
    port: 3000,
    adminApiPath: "admin-api",
    shopApiPath: "shop-api",
    ...(IS_DEV
      ? {
        adminApiPlayground: {
          settings: { "request.credentials": "include" },
        },

        adminApiDebug: true,
        shopApiPlayground: {
          settings: { "request.credentials": "include" },
        },

        shopApiDebug: true,
      }
      : {}),
  },

  authOptions: {
    tokenMethod: ["bearer", "cookie"],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },

    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
    },
  },

  dbConnectionOptions: {
    type: "postgres",
    // See the README.md "Migrations" section for an explanation of
    // the `synchronize` and `migrations` options.
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    migrations: [path.join(__dirname, "../migrations/*.+(js|ts)")],
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },

  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },

  // When adding or altering custom field definitions, the database will
  // need to be updated. See the "Migrations" section in README.md.
  customFields: {},

  plugins: [
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir: path.join(__dirname, "../../static/assets"),
      // For local dev, the correct value for assetUrlPrefix should
      // be guessed correctly, but for production it will usually need
      // to be set manually to match your production url.
      assetUrlPrefix: IS_DEV ? undefined : `${process.env.ASSET_BASE_URL}/assets/`,
    }),

    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, "../../static/email/test-emails"),
      route: "mailbox",
      handlers: defaultEmailHandlers,
      templatePath: path.join(__dirname, "../../static/email/templates"),
      globalTemplateVars: {
        // The following variables will change depending on your storefront implementation.
        // Here we are assuming a storefront running at http://localhost:8080.
        fromAddress: '"Support" <noreply@beznet.org>',
        verifyEmailAddressUrl: `${process.env.DB_NAME}:8080/verify`,
        passwordResetUrl: `${process.env.DB_NAME}/password-reset`,
        changeEmailAddressUrl: `${process.env.DB_NAME}/verify-email-address-change`,
      },
    }),

    AdminUiPlugin.init({
      route: "admin",
      port: 3002,
      adminUiConfig: {
        // apiPort: 3000,
        brand: "Kutchey Store",
        hideVendureBranding: true,
        hideVersion: true,
      },

      // app: compileUiExtensions({
      //     outputPath: path.join(__dirname, '../admin-ui'),
      //     extensions: [
      //         setBranding({
      //             // The small logo appears in the top left of the screen
      //             smallLogoPath: path.join(__dirname, 'images/my-logo-sm.png'),
      //             // The large logo is used on the login page
      //             largeLogoPath: path.join(__dirname, 'images/my-logo-lg.png'),
      //             faviconPath: path.join(__dirname, 'images/my-favicon.ico'),
      //         }),
      //     ],
      // }),
    }),
    PromotionPlugin,
  ],
};
