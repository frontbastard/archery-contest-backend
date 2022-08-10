const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const UserModel = require('../../src/models/User');
const ContestModel = require('../../src/models/Contest');

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

const userAdminId = new mongoose.Types.ObjectId();
const userAdmin = {
  _id: userAdminId,
  name: 'Test User Admin',
  email: 'testuseradmin@email.com',
  password: 'Red12345!',
  role: 'admin',
  tokens: [
    {
      token: jwt.sign({ _id: userAdminId }, process.env.JWT_SECRET),
    },
  ],
};

const contestUserOne = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test contest 1',
  description: 'Test contest description 1',
  hidden: false,
  owner: userOne._id,
};
const contestUserTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test contest 3',
  description: 'Test contest description 3',
  hidden: false,
  owner: userTwo._id,
};
const contestUserBlocked = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test contest blocked',
  description: 'Test contest description blocked',
  hidden: false,
  owner: userBlocked._id,
};

const setupDatabase = async () => {
  await UserModel.deleteMany();
  await ContestModel.deleteMany();
  await new UserModel(userOne).save();
  await new UserModel(userTwo).save();
  await new UserModel(userBlocked).save();
  await new UserModel(userAdmin).save();
  await new ContestModel(contestUserOne).save();
  await new ContestModel(contestUserTwo).save();
  await new ContestModel(contestUserBlocked).save();
};

module.exports = {
  userOneId,
  userTwoId,
  userAdminId,
  userOne,
  userTwo,
  userBlocked,
  userAdmin,
  contestUserOne,
  contestUserTwo,
  contestUserBlocked,
  setupDatabase,
};
