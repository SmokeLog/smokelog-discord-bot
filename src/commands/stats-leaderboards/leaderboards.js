/**
 * -----------------------------------------------------------
 * SmokeLog - /leaderboards Command
 * -----------------------------------------------------------
 *
 * Description: Displays top user leaderboards for overall,
 *              concentrates, flower, and carts.
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboards")
    .setDescription("View top users on SmokeLog leaderboards")
    .addSubcommand((sub) =>
      sub.setName("overall").setDescription("Top overall users")
    )
    .addSubcommand((sub) =>
      sub.setName("concentrates").setDescription("Top concentrate users")
    )
    .addSubcommand((sub) =>
      sub.setName("flower").setDescription("Top flower users")
    )
    .addSubcommand((sub) =>
      sub.setName("carts").setDescription("Top cart users")
    ),

  async execute(interaction) {
    await interaction.deferReply();

    let sub;
    try {
      sub = interaction.options.getSubcommand();
    } catch {
      sub = "overall";
    }

    const displayLabel = sub.charAt(0).toUpperCase() + sub.slice(1);
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs;
    const scores = [];

    for (const user of users) {
      const data = user.data();
      const username = data.username || `User-${user.id.slice(0, 6)}`;

      const [sessionsSnap, inventorySnap] = await Promise.all([
        db.collection("users").doc(user.id).collection("sessions").get(),
        db.collection("users").doc(user.id).collection("inventory").get(),
      ]);

      const sessions = sessionsSnap.docs.map((d) => d.data());
      const inventory = inventorySnap.docs.map((d) => d.data());

      const parseAmount = (str) => {
        if (!str) return 0;
        const match = str.match(/([\d.]+)\s*(g|oz|lb)?/i);
        if (!match) return 0;
        const num = parseFloat(match[1]);
        const unit = (match[2] || "g").toLowerCase();
        if (unit === "oz") return num * 28.3495;
        if (unit === "lb") return num * 453.592;
        return num;
      };

      const getStats = (category) => {
        const sess = sessions.filter(
          (s) => (s.category || "").toLowerCase() === category
        );
        const itemz = inventory.filter(
          (i) => i.finished && (i.category || "").toLowerCase() === category
        );

        const sessionCount = sess.length;
        const uniqueDays = new Set();

        for (const s of sess) {
          const rawDate =
            s.date?.toDate?.() ??
            s.timestamp?.toDate?.() ??
            s.createdAt ??
            s.sessionDate ??
            null;
          const d = rawDate instanceof Date ? rawDate : new Date(rawDate);
          if (!isNaN(d.getTime())) uniqueDays.add(d.toDateString());
        }

        const days = uniqueDays.size || 1;
        const avgDaily = sessionCount / days;
        const weight = itemz.reduce((sum, i) => sum + parseAmount(i.amount), 0);

        const score =
          0.3 * sessionCount + 0.3 * days + 0.2 * avgDaily + 0.1 * weight;

        return { score };
      };

      const c = getStats("concentrate");
      const f = getStats("flower");
      const t = getStats("cart");

      const categoryScore =
        sub === "concentrates"
          ? c.score
          : sub === "flower"
          ? f.score
          : sub === "carts"
          ? t.score
          : c.score + f.score + t.score;

      if (categoryScore > 0) {
        scores.push({ username, score: categoryScore });
      }
    }

    if (scores.length === 0) {
      logger.warn(`❌ No users found for leaderboard: ${displayLabel}`);
      return interaction.editReply({
        content: `🚫 No users found for the **${displayLabel}** leaderboard.`,
        flags: 64,
      });
    }

    const top = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(
        (u, i) =>
          `**#${i + 1}** – ${u.username} (Score: \`${u.score.toFixed(2)}\`)`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`🏆 Top ${displayLabel} Users`)
      .setDescription(top)
      .setColor(0x1e90ff)
      .setFooter({
        text: "SmokeLog Bot",
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setTimestamp();

    logger.success(
      `📊 ${interaction.user.tag} viewed the ${displayLabel} leaderboard`
    );

    await interaction.editReply({ embeds: [embed] });
  },
};
