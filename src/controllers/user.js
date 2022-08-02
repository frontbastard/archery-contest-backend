const sharp = require('sharp');
const UserModel = require('../models/User');
const {
  isUserParamsIDEqual,
  canViewEveryUser,
  canUpdateEveryUser,
  canDeleteEveryUser,
} = require('../permissions/user');

const add = async (req, res) => {
  const user = new UserModel(req.body);

  try {
    await user.save();
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
  if (!canViewEveryUser(req.user)) {
    return res.status(402).send('Not allowed');
  }

  const match = {};
  const sort = {};
  const isDisabled = req.query.disabled;

  if (isDisabled) {
    match.disabled = isDisabled === 'true';
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

  if (isUserParamsIDEqual(req.user, _id)) {
    return res.send(req.user);
  }

  if (!canViewEveryUser(req.user)) {
    return res.status(402).send('Not allowed');
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
      (canUpdateEveryUser(req.user) && update === 'blocked')
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const user = !canUpdateEveryUser(req.user)
      ? await req.user
      : await UserModel.findOne({ _id });

    if (!user) {
      return res.status(404).send();
    }

    if (!isUserParamsIDEqual(req.user, _id) && !canUpdateEveryUser(req.user)) {
      return res.status(402).send('Not allowed');
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
    if (!isUserParamsIDEqual(req.user, _id) && !canDeleteEveryUser(req.user)) {
      return res.status(402).send('Not allowed');
    }

    if (!canDeleteEveryUser(req.user)) {
      await req.user.remove();
      return res.send(req.user);
    }

    const user = await UserModel.findOne({ _id });

    if (!user) {
      return res.status(404).send();
    }

    user.remove();
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
