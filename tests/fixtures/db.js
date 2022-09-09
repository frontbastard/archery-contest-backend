const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { ROLE } = require('../../src/common/constants');
const UserModel = require('../../src/models/user.model');
const ContestModel = require('../../src/models/contest.model');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Test User 1',
  email: 'testuser1@email.com',
  password: 'Red12345!',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Test User 2',
  email: 'testuser2@email.com',
  password: 'Red12345!',
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
};

const userBlockedId = new mongoose.Types.ObjectId();
const userBlocked = {
  _id: userBlockedId,
  name: 'Test User Blocked',
  email: 'testuserblocked@email.com',
  password: 'Red12345!',
  blocked: true,
  tokens: [
    {
      token: jwt.sign({ _id: userBlockedId }, process.env.JWT_SECRET),
    },
  ],
};

const userMasterId = new mongoose.Types.ObjectId();
const userMaster = {
  _id: userMasterId,
  name: 'Test User Master',
  email: 'testusermaster@email.com',
  password: 'Red12345!',
  role: ROLE.Master,
  tokens: [
    {
      token: jwt.sign({ _id: userMasterId }, process.env.JWT_SECRET),
    },
  ],
};

const contestUserOne = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test contest 1',
  description: 'Test contest description 1',
  hidden: false,
  owner: { _id: userOne._id, name: userOne.name },
};
const contestUserTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test contest 3',
  description: 'Test contest description 3',
  hidden: false,
  owner: { _id: userTwo._id, name: userTwo.name },
};
const contestUserBlocked = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test contest blocked',
  description: 'Test contest description blocked',
  hidden: false,
  owner: { _id: userBlocked._id, name: userBlocked.name },
};

const setupDatabase = async () => {
  await UserModel.deleteMany();
  await ContestModel.deleteMany();
  await new UserModel(userOne).save();
  await new UserModel(userTwo).save();
  await new UserModel(userBlocked).save();
  await new UserModel(userMaster).save();
  await new ContestModel(contestUserOne).save();
  await new ContestModel(contestUserTwo).save();
  await new ContestModel(contestUserBlocked).save();
};

module.exports = {
  userOneId,
  userTwoId,
  userMasterId,
  userBlockedId,
  userOne,
  userTwo,
  userBlocked,
  userMaster,
  contestUserOne,
  contestUserTwo,
  contestUserBlocked,
  setupDatabase,
};
