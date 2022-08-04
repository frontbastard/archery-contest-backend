const sharp = require('sharp');
const UserModel = require('../models/User');
const {
  isProfileOwner,
  canViewUser,
  canUpdateUser,
  canDeleteUser,
} = require('../permissions/user');
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account');

const add = async (req, res) => {
  const user = new UserModel(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
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

  const match = {};
  const sort = {};
  const isBlocked = req.query.blocked;

  if (isBlocked) {
    match.blocked = isBlocked === 'true';
  }

  if (req.query.sortBy) {
    const [prop, value] = req.query.sortBy.split(':');

    sort[prop] = value === 'desc' ? -1 : 1;
  }

  try {
    const users = await UserModel.find(match)
      .sort(sort)
      .skip(parseInt(req.query.skip, 10))
      .limit(parseInt(req.query.limit, 10));
    const counter = await UserModel.count({});

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
  const isValidOperation = updates.every(
    (update) =>
      allowedUpdates.includes(update) ||
      (canUpdateUser(req.user) && update === 'blocked')
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const user = !canUpdateUser(req.user)
      ? await req.user
      : await UserModel.findOne({ _id });

    if (!user || (!isProfileOwner(req.user, _id) && !canUpdateUser(req.user))) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      user[update] = req.body[update];
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
    if (!isProfileOwner(req.user, _id) && !canDeleteUser(req.user)) {
      return res.status(404).send();
    }

    if (!canDeleteUser(req.user)) {
      await req.user.remove();
      return res.send(req.user);
    }

    const user = await UserModel.findOne({ _id });

    if (!user) {
      return res.status(404).send();
    }

    user.remove();
    sendCancelEmail(user.email, user.name);
    return res.send(user);
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
