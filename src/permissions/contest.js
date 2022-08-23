const { ROLE } = require('../common/constants');

const canViewContest = (user) =>
  user.role === ROLE.master ||
  user.role === ROLE.admin ||
  user.role === ROLE.moderator;

const canUpdateContest = (user) =>
  user.role === ROLE.master ||
  user.role === ROLE.admin ||
  user.role === ROLE.moderator;

const canDeleteContest = (user) =>
  user.role === ROLE.master ||
  user.role === ROLE.admin ||
  user.role === ROLE.moderator;

module.exports = {
  canViewContest,
  canUpdateContest,
  canDeleteContest,
};
