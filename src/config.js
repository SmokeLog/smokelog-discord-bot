/**
 * -----------------------------------------------------------
 * SmokeLog - Config Constants
 * -----------------------------------------------------------
 *
 * Description: Shared constants and configuration for use
 *              across the SmokeLog Discord bot.
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

module.exports = {
  BOT_NAME: "SmokeLog Bot",
  VERSION: "1.0.0",
  DEV_IDS: ["119982148945051651"],
  EMBED_COLOR: "#1e90ff",
  ENVIRONMENT: process.env.NODE_ENV || "development",
  IS_DEV: process.env.NODE_ENV !== "production",

  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID,
  DISCORD_TOKEN: process.env.DISCORD_TOKEN,

  CHANNELS: {
    WELCOME: "1288212661754138635",
    ANNOUNCEMENTS: "1288212661754138636",
    RESOURCES: "1288212661754138637",
    VERIFY: "1288374380371644426",
    SUPPORT: "1291130766604111922",
    SUPPORT_SUBMISSION_CATEGORY: "1291466264056959131",
    BUGS: "1291126522941280359",
    BUG_SUBMISSION_CATEGORY: "1291243051854856212",
    SUGGESTIONS: "1291126192233250928",
    SUGGESTION_SUBMISSION_CATEGORY: "1291469051251523624",
    STATS: "1291108129026867362",
    LEADERBOARD: "1291108213768327168",
    LOG: "1289071446919872595",
    GLASS_SHOWOFF: "1288212661754138641",
  },

  STAFF_ROLES: [
    "1288214849012240454",
    "1288215116692586721",
    "1288226491758547119",
  ],
};
