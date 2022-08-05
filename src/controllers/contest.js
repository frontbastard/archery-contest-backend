const ContestModel = require('../models/Contest');
const {
  canViewContest,
  canUpdateContest,
  canDeleteContest,
} = require('../permissions/contest');

const add = async (req, res) => {
  const contest = new ContestModel({ ...req.body, owner: req.user._id });

  await contest.save();

  try {
    res.status(201).send(contest);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getAll = async (req, res) => {
  const match = {};
  const sort = {};
  const isHidden = req.query.hidden;

  if (isHidden) {
    match.hidden = isHidden === 'true';
  }

  if (!canViewContest(req.user)) {
    match.owner = req.user._id;
  }

  if (req.query.sortBy) {
    const [prop, value] = req.query.sortBy.split(':');

    sort[prop] = value === 'desc' ? -1 : 1;
  }

  try {
    const contests = await ContestModel.find(match)
      .sort(sort)
      .skip(parseInt(req.query.skip, 10))
      .limit(parseInt(req.query.limit, 10));

    res.send(contests);
  } catch (error) {
    res.status(500).send();
  }
};

const get = async (req, res) => {
  const _id = req.params.id;
  const match = { _id };

  if (!canViewContest(req.user)) {
    match.owner = req.user._id;
  }

  try {
    const contest = await ContestModel.findOne(match);

    if (!contest) {
      res.status(404).send('Contest not found');
    }

    res.send(contest);
  } catch (error) {
    res.status(500).send();
  }
};

const update = async (req, res) => {
  const _id = req.params.id;
  const match = { _id };
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'description', 'hidden'];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (req.user.blocked) {
    return res.status(402).send({ error: 'You are blocked' });
  }

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' });
  }

  if (!canUpdateContest(req.user)) {
    match.owner = req.user._id;
  }

  try {
    const contest = await ContestModel.findOne(match);

    if (!contest) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      contest[update] = req.body[update];
    });
    await contest.save();
    return res.status(201).send(contest);
  } catch (error) {
    return res.status(400).send(error);
  }
};

const remove = async (req, res) => {
  const _id = req.params.id;
  const match = { _id };

  if (req.user.blocked) {
    return res.status(402).send({ error: 'You are blocked' });
  }

  if (!canDeleteContest(req.user)) {
    match.owner = req.user._id;
  }

  try {
    const contest = await ContestModel.findOneAndDelete(match);

    if (!contest) {
      return res.status(404).send();
    }

    return res.send(contest);
  } catch (error) {
    return res.status(500).send(error);
  }
};

module.exports = {
  add,
  getAll,
  get,
  update,
  remove,
};
