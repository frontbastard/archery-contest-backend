const { ContestModel, CONTEST_FIELDS } = require('../models/contest.model');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/sendResponse');
const {
  canViewContest,
  canUpdateContest,
  canDeleteContest,
} = require('../permissions/contest');

const add = async (req, res) => {
  const contest = new ContestModel({ ...req.body, owner: req.user._id });

  await contest.save();

  try {
    sendSuccessResponse(res, 201, contest);
  } catch (error) {
    sendErrorResponse(res, 400);
  }
};

const getAll = async (req, res) => {
  // GET /contests?hidden=true
  // GET /contests?limit=10&skip=0
  // GET /contests/sortBy=createdAt:desc
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

    sendSuccessResponse(res, 200, contests);
  } catch (error) {
    sendErrorResponse(res, 500, error);
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
      sendErrorResponse(res, 404);
      return;
    }

    sendSuccessResponse(res, 200, contest);
  } catch (error) {
    sendErrorResponse(res, 500, error);
  }
};

const update = async (req, res) => {
  const _id = req.params.id;
  const match = { _id };
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    CONTEST_FIELDS.includes(update)
  );

  if (req.user.blocked) {
    sendErrorResponse(res, 402, 'Blocked');
    return;
  }

  if (!isValidOperation) {
    sendErrorResponse(res, 400, 'Invalid updates');
    return;
  }

  if (!canUpdateContest(req.user)) {
    match.owner = req.user._id;
  }

  try {
    const contest = await ContestModel.findOne(match);

    if (!contest) {
      sendErrorResponse(res, 404);
      return;
    }

    updates.forEach((update) => {
      contest[update] = req.body[update];
    });
    await contest.save();
    sendSuccessResponse(res, 201, contest);
  } catch (error) {
    sendErrorResponse(res, 400);
  }
};

const remove = async (req, res) => {
  const _id = req.params.id;
  const match = { _id };

  if (req.user.blocked) {
    sendErrorResponse(res, 402, 'Blocked');
    return;
  }

  if (!canDeleteContest(req.user)) {
    match.owner = req.user._id;
  }

  try {
    const contest = await ContestModel.findOneAndDelete(match);

    if (!contest) {
      sendErrorResponse(res, 404);
      return;
    }

    sendSuccessResponse(res, 200, contest);
  } catch (error) {
    sendErrorResponse(res, 500, error);
  }
};

module.exports = {
  add,
  getAll,
  get,
  update,
  remove,
};
