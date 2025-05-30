/**
 * -----------------------------------------------------------
 * SmokeLog - Embed Channel Messenger Utility
 * -----------------------------------------------------------
 *
 * Description: Sends an embed to a Discord channel only if it
 *              hasn't already been posted. Combines runtime
 *              message cache with recent history checking to
 *              avoid duplicate embeds by title, except for log channel.
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
const { hasPosted, markPosted } = require("./messageCache");
const config = require("../config");

async function sendEmbedToChannel(
  client,
  channelId,
  embed,
  key,
  checkDepth = 10,
  components = null
) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) {
    return logger.error(`Channel ID ${channelId} not found in cache.`);
  }

  const isLogChannel = channelId === config.CHANNELS.LOG;

  if (!isLogChannel && hasPosted(key)) {
    return logger.info(`Skipped embed post for key "${key}" (cached)`);
  }

  try {
    if (!isLogChannel) {
      const messages = await channel.messages.fetch({ limit: checkDepth });
      const exists = messages.some(
        (msg) => msg.embeds.length && msg.embeds[0].title === embed.data.title
      );

      if (exists) {
        logger.warning(
          `Skipped embed post for key "${key}" (matched by title in history)`
        );
        return;
      }
    }

    await channel.send({
      embeds: [embed],
      components: components ? [components] : [],
    });

    if (!isLogChannel) markPosted(key);

    logger.success(
      `Posted embed "${embed.data.title}" to channel ${channelId}`
    );
  } catch (err) {
    logger.error(`Failed to send embed to ${channelId}: ${err.message}`);
  }
}

module.exports = sendEmbedToChannel;
