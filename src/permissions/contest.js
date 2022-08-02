const { ROLE } = require('../common/constants');

const canViewEveryContest = (user) =>
  user.role === ROLE.ADMIN || user.role === ROLE.MODERATOR;

const canUpdateEveryContest = (user) =>
  user.role === ROLE.ADMIN || user.role === ROLE.MODERATOR;

const canDeleteEveryContest = (user) =>
  user.role === ROLE.ADMIN || user.role === ROLE.MODERATOR;

module.exports = {
  canViewEveryContest,
  canUpdateEveryContest,
  canDeleteEveryContest,
};
