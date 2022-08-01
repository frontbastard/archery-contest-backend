const { ROLE } = require('../common/constants');
const UserModel = require('../models/User');

const isUserParamsIDEqual = (user, id) => {
  return user._id.toString() === id;
};

const canViewEveryUser = (user) => {
  return user.role === ROLE.ADMIN;
};

const canUpdateEveryUser = (user) => {
  return user.role === ROLE.ADMIN;
};

const canDeleteEveryUser = (user) => {
  return user.role === ROLE.ADMIN;
};

module.exports = {
  isUserParamsIDEqual,
  canViewEveryUser,
  canUpdateEveryUser,
  canDeleteEveryUser,
};
