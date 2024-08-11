import {
  generateMigration,
  runMigrations,
  revertLastMigration,
  bootstrapWorker,
  Logger,
} from "@vendure/core";
import { bootstrap, DefaultJobQueuePlugin } from "@vendure/core";
import { config } from "../config/vendure-config";
import path from "path";
import { initialData } from "./init-data";
import { populate } from "./populate";

const outputDir = path.join(__dirname, "../../migrations");
const productsCsvFile = require.resolve("@vendure/create/assets/products.csv");
const importAssetsDir = path.join(productsCsvFile, "../images");
const loggerCtx = 'Populate';

const populateConfig = {
  ...config,
  plugins: (config.plugins || []).filter(
    (plugin) => plugin !== DefaultJobQueuePlugin
  ),
  importExportOptions: { importAssetsDir },
  dbConnectionOptions: { ...config.dbConnectionOptions, synchronize: true },
};

export const initializeDatabase = () => {
  Logger.info(`===============================`, loggerCtx);
  
  if (config.dbConnectionOptions.synchronize) {
    generateMigration(config, {
      name: "init",
      outputDir,
    });

    runMigrations(config);

    populate(() => bootstrapWorker(populateConfig), initialData, productsCsvFile)
      .then((app) => {
        return app.close();
      })
      .then(
        () => process.exit(0),
        (err) => {
          revertLastMigration(config);
          console.log(err);
          process.exit(1);
        }
    );
    Logger.info(`===============================`, loggerCtx);
  } else {
    console.log("Database already initialized");
  }
};
