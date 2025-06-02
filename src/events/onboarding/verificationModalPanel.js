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

module.exports = async function handleVerificationModal(interaction) {
  if (
    interaction.isButton() &&
    interaction.customId === "openVerificationModal"
  ) {
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

  if (
    interaction.isModalSubmit() &&
    interaction.customId === "submitVerificationCode"
  ) {
    await interaction.deferReply({ flags: 64 });

    const submittedCode = interaction.fields
      .getTextInputValue("verificationCode")
      .toUpperCase();
    const discordId = interaction.user.id;

    try {
      const usersRef = db.collection("users");
      const snapshot = await usersRef.get();

      let matchedRef = null;

      for (const docSnap of snapshot.docs) {
        const verificationRef = docSnap.ref
          .collection("verification")
          .doc("discord");
        const verificationSnap = await verificationRef.get();

        if (!verificationSnap.exists) continue;

        const v = verificationSnap.data();

        if (
          v &&
          v.code === submittedCode &&
          v.discordId === discordId &&
          !v.verified
        ) {
          matchedRef = verificationRef;
          break;
        }
      }

      if (!matchedRef) {
        return interaction.editReply({
          content:
            "❌ Code not found or already verified. Please check your code or try again.",
        });
      }

      await matchedRef.update({
        verified: true,
        verifiedAt: new Date(),
      });

      // ✅ Update Discord roles
      const verifiedRole = config.VERIFICATION.VERIFIED_ROLE;
      const unverifiedRole = config.VERIFICATION.NOT_VERIFIED_ROLE;

      try {
        await interaction.member.roles.add(verifiedRole);
        await interaction.member.roles.remove(unverifiedRole);
        logger.success(`Updated roles for verified user ${discordId}`);
      } catch (roleErr) {
        logger.error(
          `Failed to update roles for ${discordId}: ${roleErr.message}`
        );
      }

      await interaction.editReply({
        content: "✅ You’ve been successfully verified! Welcome!",
      });

      logger.success(`Verified Discord user ${discordId}`);
    } catch (error) {
      logger.error("Verification error:", error);
      return interaction.editReply({
        content: "🚨 Something went wrong while verifying. Try again later.",
      });
    }
  }
};
