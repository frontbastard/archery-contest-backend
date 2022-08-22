const sharp = require('sharp');
const { isMatch } = require('../utils/match');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/sendResponse');
const {
  UserModel,
  USER_FIELDS,
  MASTER_FIELDS,
} = require('../models/user.model');
const { isMaster, isProfileOwner, canViewAll } = require('../permissions/user');
// const { sendCancelEmail } = require('../emails/account');

const add = async (req, res) => {
  const updates = Object.keys(req.body);

  if (isMatch(updates, MASTER_FIELDS)) {
    sendErrorResponse(res, 400, 'Invalid updates');
    return;
  }

  try {
    const user = new UserModel(req.body);
    await user.save();
    // sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    sendSuccessResponse(res, 201, { user, token });
  } catch (error) {
    sendErrorResponse(res, 400, error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    sendSuccessResponse(res, 200, { user, token });
  } catch (error) {
    sendErrorResponse(res, 400, error);
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    sendSuccessResponse(res, 200);
  } catch (error) {
    sendErrorResponse(res, 500, error);
  }
};

const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    sendSuccessResponse(res, 200);
  } catch (error) {
    sendErrorResponse(res, 500, error);
  }
};

const getAll = async (req, res) => {
  if (!canViewAll(req.user)) {
    sendErrorResponse(res, 502, 'Not allowed');
    return;
  }

  const { searchTerm, sortTerm, sortAsc, pageIndex, pageSize, filter } =
    JSON.parse(req.query.request);
  const match = { _id: { $ne: req.user._id }, role: { $ne: 'master' } };
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

    sendSuccessResponse(res, 200, {
      totalCount: counter,
      items: users.length > 0 ? users : null,
    });
  } catch (error) {
    sendErrorResponse(res, 500, error);
  }
};

const getByID = async (req, res) => {
  const _id = req.params.id;

  if (isProfileOwner(req.user, _id)) {
    sendSuccessResponse(res, 200, req.user);
    return;
  }

  if (!canViewAll(req.user)) {
    sendErrorResponse(res, 404);
    return;
  }

  try {
    const user = await UserModel.findById(_id);

    if (!user) {
      sendErrorResponse(res, 404);
      return;
    }

    sendSuccessResponse(res, 200, user);
  } catch (error) {
    sendErrorResponse(res, 500, error);
  }
};

const update = async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedFields = [...USER_FIELDS];

  try {
    const updatingUser = !isMaster(req.user)
      ? req.user
      : await UserModel.findOne({ _id });

    if (
      !updatingUser ||
      (!isProfileOwner(updatingUser, _id) && !isMaster(updatingUser))
    ) {
      sendErrorResponse(res, 404);
      return;
    }

    if (isMaster(req.user) && !isMaster(updatingUser)) {
      allowedFields.push(...MASTER_FIELDS);
    }

    if (isMatch(updates, MASTER_FIELDS)) {
      if (isMaster(updatingUser) || !isMaster(req.user)) {
        sendErrorResponse(res, 400);
        return;
      }
    }

    updates.forEach((update) => {
      const isValidOperation = isMatch(USER_FIELDS, [update]);
      const isFieldChanged = updatingUser[update] !== req.body[update];

      if (isFieldChanged && isValidOperation) {
        updatingUser[update] = req.body[update];
      }
    });
    await updatingUser.save();

    sendSuccessResponse(res, 200, updatingUser);
  } catch (error) {
    sendErrorResponse(res, 400);
  }
};

const remove = async (req, res) => {
  const _id = req.params.id;

  if (!isProfileOwner(req.user, _id) && !isMaster(req.user)) {
    sendErrorResponse(res, 404);
    return;
  }

  try {
    if (!isMaster(req.user)) {
      await req.user.remove();
      sendSuccessResponse(res, 200, req.user);
      return;
    }

    const user = await UserModel.findOne({ _id });

    if (!user) {
      sendErrorResponse(res, 404);
      return;
    }

    if (isMaster(user)) {
      sendErrorResponse(res, 400);
      return;
    }

    user.remove();
    // sendCancelEmail(user.email, user.name);
    sendSuccessResponse(res, 200, user._id);
  } catch (error) {
    sendErrorResponse(res, 500);
  }
};

const uploadAvatar = async (req, res) => {
  req.user.avatar = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();

  await req.user.save();
  sendSuccessResponse(res, 200);
};

const getAvatar = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    sendSuccessResponse(res, 200, user.avatar);
  } catch (error) {
    sendErrorResponse(res, 404);
  }
};

const removeAvatar = async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  sendSuccessResponse(res, 200);
};

module.exports = {
  add,
  login,
  logout,
  logoutAll,
  getAll,
  getByID,
  update,
  remove,
  uploadAvatar,
  getAvatar,
  removeAvatar,
};
