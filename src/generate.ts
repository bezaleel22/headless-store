import {
  generateMigration,
  revertLastMigration,
  runMigrations,
} from "@vendure/core";
import path from 'path';

import { config } from "./vendure-config";

generateMigration(config, {
  name: "init",
  outputDir: path.join(__dirname, './migrations'),
});
