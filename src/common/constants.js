module.exports = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  MODEL: {
    User: 'User',
    Contest: 'Contest',
  },
  ROLE: {
    Master: 1,
    Admin: 2,
    Moderator: 3,
    User: 4,
  },
  ERROR_CODE: {
    UnexpectedError: 101,
    PermissionDenied: 102,
    UserNotFound: 201,
    UserNotAuthenticated: 202,
    UserIsBlocked: 203,
    ContestNotFound: 301,
  },
};
