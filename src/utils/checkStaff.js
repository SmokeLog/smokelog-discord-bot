/**
 * -----------------------------------------------------------
 * SmokeLog - Utility: Staff Role Check
 * -----------------------------------------------------------
 *
 * Description: Checks if the user executing the command has
 *              a staff role as defined in config.STAFF_ROLES.
 *
 * Usage:
 *   const checkStaff = require("../../utils/checkStaff");
 *   if (!checkStaff(interaction)) { ... }
 *
 * Created by: GarlicRot
 * -----------------------------------------------------------
 */

const config = require("../config");

module.exports = function checkStaff(interaction) {
  return interaction.member.roles.cache.some((role) =>
    config.STAFF_ROLES.includes(role.id)
  );
};
