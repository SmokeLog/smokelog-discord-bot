/**
 * -----------------------------------------------------------
 * SmokeLog - /stats Command
 * -----------------------------------------------------------
 *
 * Description: Displays usage statistics for yourself or another user.
 *              Includes total sessions, consumption, and average daily use.
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

const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { db } = require("../../lib/firebase");
const logger = require("../../utils/logger");
const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
dayjs.extend(minMax);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View your own or another user's SmokeLog stats")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("(Optional) View stats for a specific user")
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const snapshot = await db.collection("users").get();

    const suggestions = snapshot.docs
      .map((doc) => doc.data().username)
      .filter((name) => name?.toLowerCase().startsWith(focused.toLowerCase()))
      .slice(0, 25);

    await interaction.respond(
      suggestions.map((name) => ({
        name,
        value: name,
      }))
    );
  },

  async execute(interaction) {
    await interaction.deferReply();

    const inputUsername = interaction.options.getString("username");

    const getUserDoc = async () => {
      if (!inputUsername) {
        const usersSnap = await db.collection("users").get();
        for (const userDoc of usersSnap.docs) {
          const verificationSnap = await userDoc.ref
            .collection("verification")
            .doc("discord")
            .get();

          if (!verificationSnap.exists) continue;

          const data = verificationSnap.data();
          if (data.discordId === interaction.user.id && data.verified) {
            return userDoc;
          }
        }
        return null;
      } else {
        const snapshot = await db
          .collection("users")
          .where("username", "==", inputUsername)
          .limit(1)
          .get();
        return snapshot.empty ? null : snapshot.docs[0];
      }
    };

    const parseAmountToGrams = (amount) => {
      if (!amount) return 0;
      const match = amount.toLowerCase().match(/([\d.]+)\s*(g|oz|lb)?/);
      if (!match) return 0;

      const value = parseFloat(match[1]);
      const unit = match[2] || "g";

      switch (unit) {
        case "oz":
          return value * 28.3495;
        case "lb":
          return value * 453.592;
        default:
          return value;
      }
    };

    const formatWeight = (grams) => {
      if (grams >= 453.592) return `${(grams / 453.592).toFixed(2)} lb`;
      if (grams >= 28.3495) return `${(grams / 28.3495).toFixed(2)} oz`;
      return `${grams.toFixed(2)} g`;
    };

    const userDoc = await getUserDoc();

    if (!userDoc) {
      logger.warning(
        `❌ User not found or not verified: ${
          inputUsername || interaction.user.tag
        }`
      );
      return interaction.editReply({
        content: "🚫 User not found or not verified.",
        flags: 64,
      });
    }

    const username = userDoc.data().username || userDoc.id;
    const userId = userDoc.id;

    const stats = {
      Concentrate: { count: 0, weight: 0, dates: [] },
      Flower: { count: 0, weight: 0, dates: [] },
      Cart: { count: 0, weight: 0, dates: [] },
    };

    // Sessions
    const sessionsSnap = await db
      .collection("users")
      .doc(userId)
      .collection("sessions")
      .get();

    for (const doc of sessionsSnap.docs) {
      const s = doc.data();
      const cat = s.category || "Unknown";
      const date =
        s.date instanceof Date
          ? dayjs(s.date)
          : dayjs(s.date?.toDate?.() ?? s.date);

      if (!stats[cat]) continue;

      stats[cat].count += 1;
      if (date?.isValid()) stats[cat].dates.push(date);
    }

    // Inventory
    const inventorySnap = await db
      .collection("users")
      .doc(userId)
      .collection("inventory")
      .get();

    for (const doc of inventorySnap.docs) {
      const item = doc.data();
      if (!item?.finished) continue;

      const cat = item.category || "Unknown";
      if (!stats[cat]) continue;

      stats[cat].weight += parseAmountToGrams(item.amount);
    }

    const getStatsBlock = (type, label) => {
      const data = stats[type];
      const minDate = dayjs.min(data.dates);
      const maxDate = dayjs.max(data.dates);
      const days = minDate && maxDate ? maxDate.diff(minDate, "day") + 1 : 1;
      const avg = data.count / days;

      return (
        `**${label}**\n` +
        `Sessions: **${data.count}**\n` +
        `Consumption: **${formatWeight(data.weight)}**\n` +
        `Avg Daily: **${avg.toFixed(2)}/day**`
      );
    };

    const embed = new EmbedBuilder()
      .setTitle(`📊 Stats for ${username}`)
      .setColor(0x1e90ff)
      .setDescription(
        [
          getStatsBlock("Concentrate", "Concentrates"),
          getStatsBlock("Flower", "Flower"),
          getStatsBlock("Cart", "Carts"),
        ].join("\n\n")
      )
      .setFooter({
        text: "SmokeLog Bot",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    logger.success(`📈 ${interaction.user.tag} viewed stats for ${username}`);
    await interaction.editReply({ embeds: [embed] });
  },
};
