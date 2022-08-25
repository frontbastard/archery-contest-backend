const { ROLE } = require('../common/constants');

const canViewContest = (user) =>
  user.role === ROLE.Master ||
  user.role === ROLE.Admin ||
  user.role === ROLE.Moderator;

const canUpdateContest = (user) =>
  user.role === ROLE.Master ||
  user.role === ROLE.Admin ||
  user.role === ROLE.Moderator;

const canDeleteContest = (user) =>
  user.role === ROLE.Master ||
  user.role === ROLE.Admin ||
  user.role === ROLE.Moderator;

module.exports = {
  canViewContest,
  canUpdateContest,
  canDeleteContest,
};
