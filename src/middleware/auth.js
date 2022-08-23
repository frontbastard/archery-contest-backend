const jwt = require('jsonwebtoken');
const { sendErrorResponse } = require('../utils/sendResponse');
const { ERROR_CODE } = require('../common/constants');
const UserModel = require('../models/user.model');

const authUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    sendErrorResponse(
      res,
      ERROR_CODE.userNotAuthenticated,
      'User not authenticated'
    );
  }
};

module.exports = {
  authUser,
};
