const { ROLE } = require('../common/constants');

const isProfileOwner = (user, userParamId) =>
  user._id.toString() === userParamId;
const isMaster = (user) => user.role === ROLE.Master;
const isAdmin = (user) => user.role === ROLE.Admin;

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
