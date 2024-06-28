import {
  generateMigration,
  runMigrations,
  revertLastMigration,
} from "@vendure/core";
import { populate } from "@vendure/core/cli";
import { bootstrap, DefaultJobQueuePlugin } from "@vendure/core";
import { config } from "../config/vendure-config";
import path from "path";
import fs from "fs";

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
  if (config.dbConnectionOptions.synchronize && !fs.existsSync(outputDir)) {
    generateMigration(config, {
      name: "init",
      outputDir,
    });

    runMigrations(config);

    populate(() => bootstrap(populateConfig), initialData, productsCsvFile)
      .then((app) => {
        if (!fs.existsSync(outputDir))
          fs.mkdirSync(outputDir, { recursive: true });

        return app.close();
      })
      .then(
        () => process.exit(0),
        (err) => {
          revertLastMigration(config);
          fs.rmSync(outputDir, { recursive: true });
          console.log(err);
          process.exit(1);
        }
      );
  } else {
    console.log("Database already initialized");
  }
};
