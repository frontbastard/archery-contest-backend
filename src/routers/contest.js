const express = require('express');
const router = new express.Router();
const Contest = require('../models/contest');
const { getValidOperationStatus } = require('../common/utils');

router.post('/contest', async (req, res) => {
  const contest = new Contest(req.body);

  await contest.save();

  try {
    res.status(201).send(contest);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/contests', async (req, res) => {
  const contest = await Contest.find({});

  try {
    res.send(contest);
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/contests/:id', async (req, res) => {
  const _id = req.params.id;

  const contest = await Contest.findById(_id);

  try {
    if (!contest) {
      return res.status(404).send;
    }

    res.send(contest);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch('/contests/:id', async (req, res) => {
  const _id = req.params.id;
  const isValidOperation = getValidOperationStatus(req.body, [
    'name',
    'description',
  ]);

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  try {
    const contest = await Contest.findByIdAndUpdate(
      _id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!contest) {
      res.status(404).send();
    }

    res.status(201).send(contest);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/contests/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const contest = await Contest.findByIdAndDelete(_id);

    if (!contest) {
      return res.status(404).send();
    }

    res.send(contest);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
