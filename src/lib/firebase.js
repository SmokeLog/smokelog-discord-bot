/**
 * -----------------------------------------------------------
 * SmokeLog - Firebase Admin SDK (Bot)
 * -----------------------------------------------------------
 *
 * Description: Initializes Firebase Admin SDK using a service
 *              account JSON file and exports Firestore instance.
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

const admin = require("firebase-admin");
const path = require("path");
const logger = require("../utils/logger");

// Path to your downloaded private key file
const keyPath = path.join(__dirname, "../../firebase-discord-key.json");

try {
  const serviceAccount = require(keyPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  logger.success("✅ Firebase Admin SDK initialized successfully");
} catch (error) {
  logger.error(`❌ Failed to initialize Firebase Admin SDK: ${error.message}`);
}

const db = admin.firestore();

module.exports = { db };
