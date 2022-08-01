const { ROLE } = require('../common/constants');
const ContestModel = require('../models/Contest');

const canViewEveryContest = (user) => {
  return user.role === ROLE.ADMIN || user.role === ROLE.MODERATOR;
};

const canUpdateEveryContest = (user) => {
  return user.role === ROLE.ADMIN || user.role === ROLE.MODERATO;
};

const canDeleteEveryContest = (user) => {
  return user.role === ROLE.ADMIN || user.role === ROLE.MODERATO;
};

module.exports = {
  canViewEveryContest,
  canUpdateEveryContest,
  canDeleteEveryContest,
};
