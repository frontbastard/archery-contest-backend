const { ROLE } = require('../common/constants');

const isUserParamsIDEqual = (user, id) => user._id.toString() === id;

const canViewEveryUser = (user) => user.role === ROLE.ADMIN;

const canUpdateEveryUser = (user) => user.role === ROLE.ADMIN;

const canDeleteEveryUser = (user) => user.role === ROLE.ADMIN;

module.exports = {
  isUserParamsIDEqual,
  canViewEveryUser,
  canUpdateEveryUser,
  canDeleteEveryUser,
};
