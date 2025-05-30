/**
 * -----------------------------------------------------------
 * SmokeLog - Error Handler Utility
 * -----------------------------------------------------------
 *
 * Description: Global error handler to log exceptions,
 *              rejections, and client-side issues in a
 *              standardized format.
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

const logger = require("./logger");

module.exports = (error, context = "General") => {
  logger.error(`[${context}] ${error.message || error}`);
  if (error.stack) console.error(error.stack);
};
