const { ERROR_CODE } = require('../common/constants');
const CustomError = require('./customError');
const { sendErrorResponse, sendSuccessResponse } = require('./sendResponse');

async function wrapResponseAsync(req, res, roles, asyncCallback) {
  const isPermitted = roles.includes(req.user.role);
  if (isPermitted) {
    try {
      const data = await asyncCallback();

      sendSuccessResponse(res, data);
    } catch (error) {
      if (error instanceof CustomError) {
        sendErrorResponse(res, error.code, error.message);
      } else {
        sendErrorResponse(res, ERROR_CODE.UnexpectedError, error);
      }
    }
  } else {
    res.status(403).send('Not authorized');
  }
}

function wrapResponse(req, res, roles, callback) {
  const isPermitted = roles.includes(req.user.role);
  if (isPermitted) {
    try {
      const data = callback();

      sendSuccessResponse(res, data);
    } catch (error) {
      if (error instanceof CustomError) {
        sendErrorResponse(res, error.code, error.message);
      } else {
        sendErrorResponse(res, ERROR_CODE.UnexpectedError, error);
      }
    }
  } else {
    res.status(403).send('Not authorized');
  }
}

module.exports = { wrapResponseAsync, wrapResponse };
