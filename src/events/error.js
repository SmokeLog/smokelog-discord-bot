/**
 * -----------------------------------------------------------
 * SmokeLog - Event: Errors
 * -----------------------------------------------------------
 *
 * Description: Handles bot-level errors like client, shard,
 *              unhandled promise rejections and exceptions.
 *
 * Created by: GarlicRot
 * GitHub: https://github.com/GarlicRot
 * SmokeLog GitHub: https://github.com/SmokeLog
 * Website: https://www.smokelog.org
 *
 * -----------------------------------------------------------
 * © 2025 SmokeLog. All Rights Reserved.
 * -----------------------------------------------------------
 */

const handleError = require("../utils/errorHandler");

module.exports = {
  name: "error-handlers",
  once: false,
  execute(client) {
    client.on("error", (error) => handleError(error, "Client Error"));
    client.on("shardError", (error) => handleError(error, "Shard Error"));

    process.on("unhandledRejection", (reason) =>
      handleError(reason, "Unhandled Rejection")
    );
    process.on("uncaughtException", (error) =>
      handleError(error, "Uncaught Exception")
    );
  },
};
