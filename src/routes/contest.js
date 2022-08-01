const express = require('express');
const router = new express.Router();
const ContestModel = require('../models/Contest');
const { authUser } = require('../middleware/auth');
const { canViewContest } = require('../permissions/contest');

router.post('/', authUser, async (req, res) => {
  const contest = new ContestModel({ ...req.body, owner: req.user._id });

  await contest.save();

  try {
    res.status(201).send(contest);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/', authUser, async (req, res) => {
  const match = {};
  const sort = {};
  const isHidden = req.query.hidden;

  if (isHidden) {
    match['hidden'] = isHidden === 'true';
  }

  if (!canViewContest(req.user)) {
    match['owner'] = req.user._id;
  }

  if (req.query.sortBy) {
    const [prop, value] = req.query.sortBy.split(':');

    sort[prop] = value === 'desc' ? -1 : 1;
  }

  try {
    const contests = await ContestModel.find(match)
      .sort(sort)
      .skip(parseInt(req.query.skip))
      .limit(parseInt(req.query.limit));

    res.send(contests);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/:id', authUser, async (req, res) => {
  const _id = req.params.id;

  try {
    const contest = await ContestModel.findOne({ _id, owner: req.user._id });

    if (!contest) {
      res.status(404).send('Contest not found');
    }

    res.send(contest);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/:id', authUser, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'description', 'hidden'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const contest = await ContestModel.findOne({ _id, owner: req.user._id });

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

router.delete('/:id', authUser, async (req, res) => {
  const _id = req.params.id;

  try {
    const contest = await ContestModel.findOneAndDelete({
      _id,
      owner: req.user._id,
    });

    if (!contest) {
      return res.status(404).send();
    }

    res.send(contest);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
