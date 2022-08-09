const { ROLE } = require('../common/constants');

const isAdmin = (user) => user.role === ROLE.ADMIN;
const isProfileOwner = (user, id) => user._id.toString() === id;
const canViewUser = (user) => user.role === ROLE.ADMIN;
const canUpdateUser = (user) => user.role === ROLE.ADMIN;
const canDeleteUser = (user) => user.role === ROLE.ADMIN;

module.exports = {
  isAdmin,
  isProfileOwner,
  canViewUser,
  canUpdateUser,
  canDeleteUser,
};
