const { ContestModel, CONTEST_FIELDS } = require('../models/contest.model');
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require('../utils/sendResponse');
const { ERROR_CODE } = require('../common/constants');
const {
  canViewAll,
  canUpdateContest,
  canDeleteContest,
} = require('../permissions/contest');

const add = async (req, res) => {
  const contest = new ContestModel({
    ...req.body,
    owner: {
      _id: req.user._id,
      name: req.user.name,
    },
  });

  await contest.save();

  try {
    sendSuccessResponse(res, contest);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.UnexpectedError, error);
  }
};

const getAll = async (req, res) => {
  const { searchTerm, sortTerm, sortAsc, pageIndex, pageSize, filter } =
    JSON.parse(req.query.request);
  const match = {};
  const sort = {};
  const skip = pageIndex * pageSize;
  const limit = pageSize;

  if (!canViewAll(req.user)) {
    match.owner = req.user.owner;
  }

  if (filter && filter.hidden !== null) {
    match.hidden = filter.hidden;
  }

  if (searchTerm) {
    match.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { owner: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (sortAsc) {
    sort[sortTerm] = sortAsc === 'asc' ? 1 : -1;
  }

  try {
    const contests = await ContestModel.find({ match })
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const counter = await ContestModel.count(match);

    sendSuccessResponse(res, {
      totalCount: counter,
      items: contests.length > 0 ? contests : null,
    });
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.UnexpectedError, error);
  }
};

const get = async (req, res) => {
  const _id = req.params.id;
  const match = { _id };

  if (!canViewAll(req.user)) {
    match.owner = req.user._id;
  }

  try {
    const contest = await ContestModel.findOne(match);

    if (!contest) {
      sendErrorResponse(res, ERROR_CODE.ContestNotFound, 'Contest not found');
      return;
    }

    sendSuccessResponse(res, contest);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.UnexpectedError, error);
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
      sendErrorResponse(res, ERROR_CODE.ContestNotFound, 'Contest not found');
      return;
    }

    updates.forEach((update) => {
      contest[update] = req.body[update];
    });
    await contest.save();
    sendSuccessResponse(res, contest);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.UnexpectedError, error);
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
      sendErrorResponse(res, ERROR_CODE.ContestNotFound, 'Contest not found');
      return;
    }

    sendSuccessResponse(res, contest);
  } catch (error) {
    sendErrorResponse(res, ERROR_CODE.UnexpectedError, error);
  }
};

module.exports = {
  add,
  getAll,
  get,
  update,
  remove,
};
