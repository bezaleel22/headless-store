import { bootstrap, runMigrations, bootstrapWorker } from "@vendure/core";
import { config } from "./config/vendure-config";
import { parseArgs } from "node:util";
import { initializeDatabase } from "./utils/initdb";

const args = parseArgs({
  options: {
    init: {
      type: "boolean",
      short: "i",
    },
    worker: {
      type: "boolean",
      short: "w",
    },
    server: {
      type: "boolean",
      short: "s",
    },
  },
});

if (args.values.init) {
  initializeDatabase();
}

if (args.values.worker) {
  bootstrapWorker(config)
    .then((worker) => worker.startJobQueue())
    .catch((err) => {
      console.log(err);
    });
}

if (args.values.server) {
  runMigrations(config)
    .then(() => bootstrap(config))
    .catch((err) => {
      console.log(err);
    });
}
