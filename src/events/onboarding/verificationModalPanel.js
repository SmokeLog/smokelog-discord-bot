/**
 * -----------------------------------------------------------
 * SmokeLog - Discord Verification Modal Handler
 * -----------------------------------------------------------
 *
 * Description: Handles the verification modal shown to users
 *              in the #click-to-verify channel. Accepts a code
 *              from the website and updates the database if valid.
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

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

const { db } = require("../../lib/firebase");
const config = require("../../config");
const logger = require("../../utils/logger");

function normCode(s) {
  return String(s || "").trim().toUpperCase();
}

function buildPossibleDiscordIds(user) {
  // Snowflake
  const snowflake = String(user.id);

  // Legacy tag (username#1234) — many users no longer have discriminators, but keep for safety
  const legacyTag =
    user.discriminator && user.discriminator !== "0"
      ? `${user.username}#${user.discriminator}`
      : null;

  // Compact form like "Name1234" (what your site currently saved)
  const compact =
    user.discriminator && user.discriminator !== "0"
      ? `${user.username}${user.discriminator}`
      : `${user.username}${user.globalName ? "" : ""}`;

  // Plain username (last resort)
  const plain = user.username;

  // Case-insensitive matching for non-snowflake forms
  const out = new Set([snowflake, compact?.toLowerCase(), legacyTag?.toLowerCase(), plain?.toLowerCase()].filter(Boolean));
  return { snowflake, all: out };
}

module.exports = async function handleVerificationModal(interaction) {
  // Open modal
  if (interaction.isButton() && interaction.customId === "openVerificationModal") {
    const modal = new ModalBuilder()
      .setCustomId("submitVerificationCode")
      .setTitle("Enter Your Verification Code");

    const codeInput = new TextInputBuilder()
      .setCustomId("verificationCode")
      .setLabel("Enter the 6-character code from the website")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(6);

    modal.addComponents(new ActionRowBuilder().addComponents(codeInput));
    return interaction.showModal(modal);
  }

  // Handle modal submit
  if (interaction.isModalSubmit() && interaction.customId === "submitVerificationCode") {
    await interaction.deferReply({ flags: 64 }); // ephemeral

    const submittedCode = normCode(
      interaction.fields.getTextInputValue("verificationCode")
    );

    const { snowflake, all: possibleIds } = buildPossibleDiscordIds(interaction.user);

    try {
      const usersRef = db.collection("users");
      const snapshot = await usersRef.get();

      let matchedRef = null;
      let matchedDocOwner = null;

      // NOTE: We scan users/*/verification/discord. If this gets large,
      // consider a collectionGroup query with indexes (verification where code== and verified==false).
      for (const docSnap of snapshot.docs) {
        const verificationRef = docSnap.ref.collection("verification").doc("discord");
        const verificationSnap = await verificationRef.get();
        if (!verificationSnap.exists) continue;

        const v = verificationSnap.data();
        const storedCode = normCode(v.code);
        const storedId = String(v.discordId || "").trim();
        const storedIdLc = storedId.toLowerCase(); // <-- normalize for non-snowflake comparisons

        const idMatches =
          possibleIds.has(storedIdLc) || // case-insensitive match for username/tag forms
          storedId === snowflake;        // exact snowflake match

        if (storedCode === submittedCode && idMatches && !v.verified) {
          matchedRef = verificationRef;
          matchedDocOwner = docSnap.id;
          break;
        }
      }

      if (!matchedRef) {
        logger.warning(
          `Verify failed: no matching doc for user=${snowflake} code=${submittedCode}`
        );
        return interaction.editReply({
          content:
            "❌ Code not found or already verified. Please check your code and try again.",
        });
      }

      // Mark verified; also backfill the canonical snowflake
      await matchedRef.set(
        {
          verified: true,
          verifiedAt: new Date(),
          discordId: snowflake, // backfill canonical form
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // ✅ Update Discord roles
      const verifiedRole = config.VERIFICATION.VERIFIED_ROLE;
      const unverifiedRole = config.VERIFICATION.NOT_VERIFIED_ROLE;

      try {
        // Fetch fresh member to avoid partial payload issues
        const member =
          (await interaction.guild.members
            .fetch(snowflake)
            .catch(() => null)) || interaction.member;

        if (!member) throw new Error("Member not found in guild.");

        await member.roles.add(verifiedRole);
        await member.roles.remove(unverifiedRole);
        logger.success(
          `Verified and updated roles for user=${snowflake} (docOwner=${matchedDocOwner})`
        );
      } catch (roleErr) {
        logger.error(
          `Role update failed for user=${snowflake}: ${roleErr.message}`
        );
      }

      await interaction.editReply({
        content: "✅ You’ve been successfully verified! Welcome!",
      });
    } catch (error) {
      logger.error(`Verification handler error: ${error.stack || error}`);
      return interaction.editReply({
        content: "🚨 Something went wrong while verifying. Please try again later.",
      });
    }
  }
};
