const { ROLE } = require('../common/constants');

const canViewContest = (user) =>
  user.role === ROLE.ADMIN || user.role === ROLE.MODERATOR;

const canUpdateContest = (user) =>
  user.role === ROLE.ADMIN || user.role === ROLE.MODERATOR;

const canDeleteContest = (user) =>
  user.role === ROLE.ADMIN || user.role === ROLE.MODERATOR;

module.exports = {
  canViewContest,
  canUpdateContest,
  canDeleteContest,
};
