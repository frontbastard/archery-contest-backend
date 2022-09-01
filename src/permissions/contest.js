const { ROLE } = require('../common/constants');

const isOwner = (user, contestOwnerId) =>
  user._id.toString() === contestOwnerId.toString();
const isMaster = (user) => user.role === ROLE.Master;
const isAdmin = (user) => user.role === ROLE.Admin;
const isModerator = (user) => user.role === ROLE.Moderator;

const canViewAll = (user) =>
  isMaster(user) || isAdmin(user) || isModerator(user);
const canUpdateContest = (user) =>
  isMaster(user) || isAdmin(user) || isModerator(user);
const canDeleteContest = (user) =>
  isMaster(user) || isAdmin(user) || isModerator(user);

module.exports = {
  isOwner,
  canViewAll,
  canUpdateContest,
  canDeleteContest,
};
