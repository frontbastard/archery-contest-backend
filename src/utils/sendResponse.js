const { IS_DEVELOPMENT } = require('../common/constants');

const sendErrorResponse = (res, errorCode, error) =>
  res.status(200).send({
    errorCode,
    data: null,
    success: false,
    error: IS_DEVELOPMENT && error,
  });

const sendSuccessResponse = (res, data) =>
  res.status(200).send({
    errorCode: null,
    data,
    success: true,
    error: null,
  });

module.exports = {
  sendErrorResponse,
  sendSuccessResponse,
};
