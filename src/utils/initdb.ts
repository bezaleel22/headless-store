import {
  generateMigration,
  runMigrations,
  revertLastMigration,
} from "@vendure/core";
import { populate } from "@vendure/core/cli";
import { bootstrap, DefaultJobQueuePlugin } from "@vendure/core";
import { config } from "../config/vendure-config";
import path from "path";

const outputDir = path.join(__dirname, "../../migrations");
const initialData = require.resolve("@vendure/create/assets/initial-data.json");
const productsCsvFile = require.resolve("@vendure/create/assets/products.csv");
const importAssetsDir = path.join(productsCsvFile, "../images");

const populateConfig = {
  ...config,
  plugins: (config.plugins || []).filter(
    (plugin) => plugin !== DefaultJobQueuePlugin
  ),
  importExportOptions: { importAssetsDir },
  dbConnectionOptions: { ...config.dbConnectionOptions, synchronize: true },
};

export const initializeDatabase = () => {
  if (config.dbConnectionOptions.synchronize) {
    generateMigration(config, {
      name: "init",
      outputDir,
    });

    runMigrations(config);

    populate(() => bootstrap(populateConfig), initialData, productsCsvFile)
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
  } else {
    console.log("Database already initialized");
  }
};
