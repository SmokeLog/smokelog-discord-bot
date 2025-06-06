/**
 * -----------------------------------------------------------
 * SmokeLog - Utility: withStaffCheck Wrapper
 * -----------------------------------------------------------
 *
 * Description: Wraps a command's execute function with a
 *              staff role check using the checkStaff utility.
 *
 * Usage:
 *   const withStaffCheck = require("../../utils/withStaffCheck");
 *   execute: withStaffCheck(async (interaction) => { ... })
 *
 * Created by: GarlicRot
 * -----------------------------------------------------------
 */

const checkStaff = require("./checkStaff");

module.exports = function withStaffCheck(executeFn) {
  return async function (interaction) {
    if (!checkStaff(interaction)) {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        flags: 64,
      });
    }

    return executeFn(interaction);
  };
};
