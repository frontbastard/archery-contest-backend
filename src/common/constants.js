module.exports = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  MODEL: {
    user: 'User',
    contest: 'Contest',
  },
  ROLE: {
    master: 1,
    admin: 2,
    moderator: 3,
    user: 4,
  },
  ERROR_CODE: {
    unexpectedError: 101,
    permissionDenied: 102,
    userNotFound: 201,
    userNotAuthenticated: 202,
  },
};
