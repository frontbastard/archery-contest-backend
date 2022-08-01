const { ROLE } = require('../common/constants');
const ContestModel = require('../models/Contest');

const canViewContest = (user) => {
  return user.role === ROLE.ADMIN || user.role === ROLE.MODERATOR;
};

module.exports = {
  canViewContest,
};
