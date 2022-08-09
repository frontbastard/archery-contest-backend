const sharp = require('sharp');
const UserModel = require('../models/User');
const {
  isAdmin,
  isProfileOwner,
  canViewUser,
  canUpdateUser,
  canDeleteUser,
} = require('../permissions/user');
const { sendCancelEmail } = require('../emails/account');

const add = async (req, res) => {
  const user = new UserModel(req.body);

  try {
    await user.save();
    // sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
};

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
};

const logoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
};

const getAll = async (req, res) => {
  if (!canViewUser(req.user)) {
    return res.status(402).send('Not allowed');
  }

  const { searchTerm, sortTerm, sortAsc, pageIndex, pageSize, filter } =
    JSON.parse(req.query.request);
  const match = {};
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

    return res.send({ totalCount: counter, items: users });
  } catch (error) {
    return res.status(500).send();
  }
};

const get = async (req, res) => {
  const _id = req.params.id;

  if (isProfileOwner(req.user, _id)) {
    return res.send(req.user);
  }

  if (!canViewUser(req.user)) {
    return res.status(404).send();
  }

  try {
    const user = await UserModel.findById(_id);

    if (!user) {
      return res.status(404).send();
    }

    return res.send(user);
  } catch (error) {
    return res.status(500).send();
  }
};

const update = async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age'];

  try {
    const user = !isAdmin(req.user)
      ? req.user
      : await UserModel.findOne({ _id });

    if (!user || (!isProfileOwner(user, _id) && !isAdmin(user))) {
      return res.status(404).send();
    }

    if (isAdmin(req.user) && !isAdmin(user)) {
      allowedUpdates.push('blocked', 'role');
    }

    updates.forEach((update) => {
      const isValidOperation = allowedUpdates.includes(update);
      const isFieldChanged = user[update] !== req.body[update];

      if (isFieldChanged && isValidOperation) {
        user[update] = req.body[update];
      }
    });
    await user.save();

    return res.send(user);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const remove = async (req, res) => {
  const _id = req.params.id;

  try {
    if (!isProfileOwner(req.user, _id) && !isAdmin(req.user)) {
      return res.status(404).send();
    }

    if (!isAdmin(req.user)) {
      await req.user.remove();
      return res.send(req.user);
    }

    const user = await UserModel.findOne({ _id });

    if (!user) {
      return res.status(404).send();
    }

    if (isAdmin(user)) {
      return res.status(400).send('Admin can not be deleted');
    }

    user.remove();
    // sendCancelEmail(user.email, user.name);
    return res.send(user._id);
  } catch (error) {
    return res.status(500).send();
  }
};

const uploadAvatar = async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({ width: 250, height: 250 })
    .png()
    .toBuffer();
  req.user.avatar = buffer;

  await req.user.save();
  res.send();
};

const getAvatar = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
};

const removeAvatar = async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
};

module.exports = {
  add,
  login,
  logout,
  logoutAll,
  getAll,
  get,
  update,
  remove,
  uploadAvatar,
  getAvatar,
  removeAvatar,
};
