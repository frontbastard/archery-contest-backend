const { ROLE } = require('../common/constants');

const isMaster = (user) => user.role === ROLE.Master;
const isAdmin = (user) => user.role === ROLE.Admin;
const isModerator = (user) => user.role === ROLE.Moderator;

const canViewAll = (user) => isMaster(user) || isAdmin(user) || isModerator;
const canUpdateContest = (user) =>
  isMaster(user) || isAdmin(user) || isModerator;
const canDeleteContest = (user) =>
  isMaster(user) || isAdmin(user) || isModerator;

module.exports = {
  canViewAll,
  canUpdateContest,
  canDeleteContest,
};
