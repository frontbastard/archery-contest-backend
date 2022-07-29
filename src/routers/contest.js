const express = require('express');
const router = new express.Router();
const Contest = require('../models/contest');
const { getValidOperationStatus } = require('../common/utils');
const auth = require('../middleware/auth');
const routes = require('../common/routes');

router.post(`/${routes.contests}`, auth, async (req, res) => {
  const contest = new Contest({ ...req.body, owner: req.user._id });

  await contest.save();

  try {
    res.status(201).send(contest);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get(`/${routes.contests}`, auth, async (req, res) => {
  try {
    await req.user.populate('contests');
    // const contests = await Contest.find({ owner: req.user._id }); // alternative

    // res.send(contests); // alternative
    res.send(req.user.contests);
  } catch (error) {
    res.status(500).send();
  }
});

router.get(`/${routes.contests}/:id`, auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const contests = await Contest.findOne({ _id, owner: req.user._id });

    res.send(contests);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch(`/${routes.contests}/:id`, auth, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'description'];
  const isValidOperation = getValidOperationStatus(updates, allowedUpdates);

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const contest = await Contest.findOne({ _id, owner: req.user._id });
 
    if (!contest) {
      res.status(404).send();
    }

    updates.forEach((update) => (contest[update] = req.body[update]));
    await contest.save();
    res.status(201).send(contest);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete(`/${routes.contests}/:id`, auth, async (req, res) => {
  const _id = req.params.id;

  try {
    const contest = await Contest.findOneAndDelete({_id, owner: req.user._id});

    if (!contest) {
      return res.status(404).send();
    }

    res.send(contest);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
