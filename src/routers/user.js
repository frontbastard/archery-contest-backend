const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const { getValidOperationStatus } = require('../common/utils');
const routes = require('../common/routes');
const auth = require('../middleware/auth');

router.post(`/${routes.users}`, async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post(`/${routes.users}/login`, async (req, res) => {
  const _email = req.body.email;
  const _password = req.body.password;

  try {
    const user = await User.findByCredentials(_email, _password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(400).send();
  }
});

router.post(`/${routes.users}/logout`, auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post(`/${routes.users}/logout-all-devices`, auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get(`/${routes.users}`, auth, async (req, res) => {
  res.send(req.user);
});

router.get(`/${routes.users}/:id`, async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch(`/${routes.users}`, auth, async (req, res) => {
  const _id = req.params.id;
  
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'age', 'blocked'];
  const isValidOperation = getValidOperationStatus(updates, allowedUpdates);

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const user = await req.user;

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete(`/${routes.users}`, auth, async (req, res) => {
  const _id = req.user._id;

  try {
    await req.user.deleteOne(_id);
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
