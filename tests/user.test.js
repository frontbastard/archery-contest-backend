const request = require('supertest');
const { ERROR_CODE, ROLE } = require('../src/common/constants');
const app = require('../src/app');
const UserModel = require('../src/models/user.model');
const {
  userOneId,
  userMasterId,
  userOne,
  userTwo,
  userMaster,
  setupDatabase,
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const response = await request(app).post('/archery-contest-api/users').send({
    name: 'Test User',
    email: 'testuser@email.com',
    password: 'Red12345!',
  });
  expect(response.body.success).toBe(true);
  // Assert that the database was changed correctly
  const user = await UserModel.findById(response.body.data.user._id);
  expect(user).not.toBeNull();

  // Assertions about the response (only for one property)
  // expect(response.body.data.user.name).toBe('Test User'); // Only for one property

  // Assertions about the response (for the whole object)
  expect(response.body.data).toMatchObject({
    user: {
      name: 'Test User',
      email: 'testuser@email.com',
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe('Red12345!');
});

test('Should not signup a user with not allowed fields', async () => {
  const response = await request(app).post('/archery-contest-api/users').send({
    name: 'Test User',
    email: 'testuser@email.com',
    password: 'Red12345!',
    blocked: true,
    role: 2,
  });
  expect(response.body.data.user.blocked).toBe(false);
  expect(response.body.data.user.role).toBe(4);
});

test('Should not signup user with invalid name/email/password', async () => {
  const response = await request(app).post('/archery-contest-api/users').send({
    name: 'A',
    email: 'incorrect_Email',
    password: '123',
  });
  expect(response.body.success).toBe(false);
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/archery-contest-api/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    });
  expect(response.body.success).toBe(true);
  const user = await UserModel.findById(response.body.data.user._id);
  expect(response.body.data.token).toBe(
    user.tokens[user.tokens.length - 1].token
  );
});

test('Should not login nonexistent user', async () => {
  const response = await request(app)
    .post('/archery-contest-api/users/login')
    .send({
      email: `a${userOne.email}`,
      password: userOne.password,
    });
  expect(response.body.errorCode).toBe(ERROR_CODE.UserNotFound);
});

test('Should fetch user profile', async () => {
  const response = await request(app)
    .get(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send();
  expect(response.body.success).toBe(true);
  expect(response.body.data.email).toBe('testuser1@email.com');
});

test('Should not fetch other user profile', async () => {
  const response = await request(app)
    .get(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send();
  expect(response.body.errorCode).toBe(ERROR_CODE.UserNotFound);
});

test('Should if master fetch other user profile', async () => {
  const response = await request(app)
    .get(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.success).toBe(true);
  expect(response.body.data.email).toBe('testuser1@email.com');
});

test('Should if master fetch other user profiles but not master role', async () => {
  const response = await request(app)
    .get('/archery-contest-api/users?request={}')
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.success).toBe(true);
  const users = await UserModel.find({ role: { $ne: ROLE.Master } });
  expect(users.length).toBe(response.body.data.totalCount);
});

test('Should if master fetch blocked users', async () => {
  const response = await request(app)
    .get('/archery-contest-api/users?request={"filter":{"blocked":"true"}}')
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.success).toBe(true);
  const unblocked = response.body.data.items.some(
    (user) => user.blocked === false
  );
  expect(unblocked).toBe(false);
});

test('Should if master fetch sorted users', async () => {
  const response = await request(app)
    .get(
      '/archery-contest-api/users?request={"sortTerm":"createdAt","sortAsc":"asc"}'
    )
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.success).toBe(true);
  expect(response.body.data.createdAt).toBe(userOne.createdAt);
});

test('Should if master fetch limit/skip users', async () => {
  const response = await request(app)
    .get('/archery-contest-api/users?request={"pageIndex":1,"pageSize":1}')
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.success).toBe(true);
  expect(response.body.data.items[0].email).toBe(userTwo.email);
});

test('Should not fetch user profile being unauthenticated', async () => {
  const response = await request(app)
    .get(`/archery-contest-api/users/${userOneId}`)
    .send();
  expect(response.body.success).not.toBe(true);
});

test('Should update valid user fields', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Changed User Name',
    });
  expect(response.body.success).toBe(true);
  expect(response.body.data).toMatchObject({
    name: 'Changed User Name',
  });
  const user = await UserModel.findById(userOneId);
  expect(user.name).toBe('Changed User Name');
});

test('Should not update "role" and "blocked" fields', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      blocked: true,
      role: 2,
    });
  expect(response.body.data).toMatchObject({
    blocked: false,
    role: 4,
  });
});

test('Should not update user if unauthenticated', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .send({
      name: 'Changed User Name',
    });
  expect(response.body.errorCode).toBe(ERROR_CODE.UserNotAuthenticated);
});

test('Should not update other user', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
      name: 'Changed User Name',
    });
  expect(response.body.errorCode).toBe(ERROR_CODE.UserNotFound);
});

test('Should not update user with invalid name/email/password', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'A',
      email: 'incorrect_Email',
      password: '123',
    });
  expect(response.body.success).toBe(false);
});

test('Should if master update other user', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send({
      name: 'Changed User Name',
    });
  expect(response.body.success).toBe(true);
  expect(response.body.data).toMatchObject({
    name: 'Changed User Name',
  });
});

test('Should delete user profile', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send();

  expect(response.body.success).toBe(true);
  const user = await UserModel.findById(userOneId);
  expect(user).toBeNull();
});

test('Should not delete not existence profile', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/users/62f13d44779b74210f02d448`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send();
  expect(response.body.success).not.toBe(true);
});

test('Should not delete other user profile', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send();
  expect(response.body.errorCode).toBe(ERROR_CODE.PermissionDenied);
  const user = await UserModel.findById(userOneId);
  expect(user).not.toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/users/${userOneId}`)
    .send();
  expect(response.body.errorCode).toBe(ERROR_CODE.UserNotAuthenticated);
});

test('Should if canDeleteUser delete other user profile', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();

  expect(response.body._id).not.toBe(userOneId);

  const user = await UserModel.findById(userOneId);
  expect(user).toBeNull();
});

test('Should if master can not delete master profile', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/users/${userMasterId}`)
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.errorCode).toBe(ERROR_CODE.PermissionDenied);
  const user = await UserModel.findById(userMasterId);
  expect(user).not.toBeNull();
});

// test('Should upload avatar image', async () => {
//   await request(app)
//     .post(`/archery-contest-api/users/profile/avatar`)
//     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
//     .attach('avatar', 'tests/fixtures/avatar.png')
//     .expect(200);
//   const user = await UserModel.findById(userOneId);
//   expect(user.avatar).toEqual(expect.any(Buffer));
// });
