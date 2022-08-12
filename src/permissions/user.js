const { ROLE } = require('../common/constants');

const isProfileOwner = (user, id) => user._id.toString() === id;
const isMaster = (user) => user.role === ROLE.MASTER;
const isAdmin = (user) => user.role === ROLE.ADMIN;
const canViewAll = (user) => isMaster(user) || isAdmin(user);
const canUpdateUser = (user) => isMaster(user) || isAdmin(user);
const canDeleteUser = (user) => isMaster(user) || isAdmin(user);

module.exports = {
  isMaster,
  isProfileOwner,
  canViewAll,
  canUpdateUser,
  canDeleteUser,
};
