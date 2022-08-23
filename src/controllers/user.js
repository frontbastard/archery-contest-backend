// const sharp = require('sharp');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/sendResponse');
const UserModel = require('../models/user.model');
const { ERROR_CODE, ROLE } = require('../common/constants');
const {
  isMaster,
  isProfileOwner,
  canViewAll,
  canUpdateUser,
  canDeleteUser,
} = require('../permissions/user');
// const { sendCancelEmail } = require('../emails/account');

const signup = async (req, res) => {
  try {
    const user = new UserModel({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      dateOfBirth: req.body.dateOfBirth,
    });
    // sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    await user.save();
    sendSuccessResponse(res, { user, token });
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.unexpectedError, error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findByCredentials(email, password);

    if (!user) {
      sendErrorResponse(res, ERROR_CODE.userNotFound);
      return;
    }

    const token = await user.generateAuthToken();
    sendSuccessResponse(res, { user, token });
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.unexpectedError, error);
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    sendSuccessResponse(res);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.unexpectedError, error);
  }
};

const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    sendSuccessResponse(res);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.unexpectedError, error);
  }
};

const getAll = async (req, res) => {
  if (!canViewAll(req.user)) {
    sendErrorResponse(res, ERROR_CODE.permissionDenied, 'Permission denied');
    return;
  }

  const { searchTerm, sortTerm, sortAsc, pageIndex, pageSize, filter } =
    JSON.parse(req.query.request);
  const match = { _id: { $ne: req.user._id }, role: { $ne: ROLE.master } };
  const sort = {};
  const skip = pageIndex * pageSize;
  const limit = pageSize;

  if (filter && filter.blocked !== null) {
    match.blocked = filter.blocked;
  }

  if (searchTerm) {
    match.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (sortAsc) {
    sort[sortTerm] = sortAsc === 'asc' ? 1 : -1;
  }

  try {
    const users = await UserModel.find(match)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const counter = await UserModel.count(match);

    sendSuccessResponse(res, {
      totalCount: counter,
      items: users.length > 0 ? users : null,
    });
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.unexpectedError, error);
  }
};

const getByID = async (req, res) => {
  const paramUserId = req.params.id;

  if (isProfileOwner(req.user, paramUserId)) {
    sendSuccessResponse(res, req.user);
    return;
  }

  if (!canViewAll(req.user)) {
    sendErrorResponse(res, ERROR_CODE.userNotFound);
    return;
  }

  try {
    const user = await UserModel.findById(paramUserId);

    if (!user) {
      sendErrorResponse(res, ERROR_CODE.userNotFound);
      return;
    }

    sendSuccessResponse(res, user);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.unexpectedError, error);
  }
};

const update = async (req, res) => {
  const paramUserId = req.params.id;
  const allowedFields = ['name', 'email', 'password', 'dateOfBirth'];

  try {
    const updatingUser = await UserModel.findOne({ _id: paramUserId });

    if (!updatingUser) {
      sendErrorResponse(res, ERROR_CODE.userNotFound, 'User not found');
      return;
    }

    if (canUpdateUser(req.user)) {
      allowedFields.push('blocked', 'role');
    }

    allowedFields.forEach((update) => {
      if (req.body[update] !== undefined) {
        updatingUser[update] = req.body[update];
      }
    });
    await updatingUser.save();
    sendSuccessResponse(res, updatingUser);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.unexpectedError, error);
  }
};

const remove = async (req, res) => {
  const paramUserId = req.params.id;

  if (!isProfileOwner(req.user, paramUserId) && !canDeleteUser(req.user)) {
    sendErrorResponse(res, ERROR_CODE.permissionDenied, 'Permission denied');
    return;
  }

  try {
    const user = await UserModel.findOne({ _id: paramUserId });

    if (!user) {
      sendErrorResponse(res, ERROR_CODE.userNotFound, 'User not found');
      return;
    }

    if (isMaster(user)) {
      sendErrorResponse(res, ERROR_CODE.permissionDenied, 'Permission denied');
      return;
    }

    user.remove();
    // sendCancelEmail(user.email, user.name);
    sendSuccessResponse(res, user._id);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.unexpectedError, error);
  }
};

// const uploadAvatar = async (req, res) => {
//   req.user.avatar = await sharp(req.file.buffer)
//     .resize({ width: 250, height: 250 })
//     .png()
//     .toBuffer();
//
//   await req.user.save();
//   sendSuccessResponse(res, 200);
// };
//
// const getAvatar = async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.params.id);
//
//     if (!user || !user.avatar) {
//       throw new Error();
//     }
//
//     res.set('Content-Type', 'image/png');
//     sendSuccessResponse(res, 200, user.avatar);
//   } catch (error) {
//     sendErrorResponse(res, 404);
//   }
// };
//
// const removeAvatar = async (req, res) => {
//   req.user.avatar = undefined;
//   await req.user.save();
//   sendSuccessResponse(res, 200);
// };

module.exports = {
  signup,
  login,
  logout,
  logoutAll,
  getAll,
  getByID,
  update,
  remove,
  // uploadAvatar,
  // getAvatar,
  // removeAvatar,
};
