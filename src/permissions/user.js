const { ROLE } = require('../common/constants');
const UserModel = require('../models/User');

const isUserParamsIDEqual = (user, id) => {
  return user._id.toString() === id;
};

const canViewUsers = (user) => {
  return user.role === ROLE.ADMIN;
};

const canUpdateUsers = (user) => {
  return user.role === ROLE.ADMIN;
};

const canDeleteUsers = (user) => {
  return user.role === ROLE.ADMIN;
};

module.exports = {
  isUserParamsIDEqual,
  canViewUsers,
  canUpdateUsers,
  canDeleteUsers,
};
