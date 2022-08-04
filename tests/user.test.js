const request = require('supertest');
const app = require('../src/app');
const UserModel = require('../src/models/User');
const {
  userOneId,
  userOne,
  userTwo,
  userAdmin,
  setupDatabase,
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/archery-contest-api/users')
    .send({
      name: 'Test User',
      email: 'testuser@email.com',
      password: 'Red12345!',
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await UserModel.findById(response.body.user._id);

  expect(user).not.toBeNull();

  // Assertions about the response (only for one property)
  // expect(response.body.user.name).toBe('Test User'); // Only for one property

  // Assertions about the response (for the whole object)
  expect(response.body).toMatchObject({
    user: {
      name: 'Test User',
      email: 'testuser@email.com',
    },
    token: user.tokens[0].token,
  });
  expect(user.password).not.toBe('Red12345!');
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/archery-contest-api/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await UserModel.findById(response.body.user._id);

  expect(response.body.token).toBe(user.tokens[user.tokens.length - 1].token);
});

test('Should not login nonexistent user', async () => {
  await request(app)
    .post('/archery-contest-api/users/login')
    .send({
      email: `a${userOne.email}`,
      password: userOne.password,
    })
    .expect(400);
});

test('Should get user profile', async () => {
  await request(app)
    .get(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get other user profile', async () => {
  await request(app)
    .get(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
});

test('Should get other user profile being admin', async () => {
  await request(app)
    .get(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get user profile being unauthenticated', async () => {
  await request(app)
    .get(`/archery-contest-api/users/${userOneId}`)
    .send()
    .expect(401);
});

test('Should update valid user fields', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Changed User Name',
    })
    .expect(200);

  expect(response.body).toMatchObject({
    name: 'Changed User Name',
  });
});

test('Should not update invalid user fields', async () => {
  await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      nonexistentField: 'Dummy Value',
    })
    .expect(400);
});

test('Should not update other user', async () => {
  await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
      name: 'Changed User Name',
    })
    .expect(404);
});

test('Should update other user being admin', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send({
      name: 'Changed User Name',
    })
    .expect(200);

  expect(response.body).toMatchObject({
    name: 'Changed User Name',
  });
});

test('Should delete user profile', async () => {
  await request(app)
    .delete(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await UserModel.findById(userOneId);

  expect(user).toBeNull();
});

test('Should not delete other user profile', async () => {
  await request(app)
    .delete(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const user = await UserModel.findById(userOneId);

  expect(user).not.toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete(`/archery-contest-api/users/${userOneId}`)
    .send()
    .expect(401);
});

test('Should delete other user profile being admin', async () => {
  await request(app)
    .delete(`/archery-contest-api/users/${userOneId}`)
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send()
    .expect(200);

  // const user = await UserModel.findById(userOneId);
  //
  // expect(user).toBeNull();
});

test('Should upload avatar image', async () => {
  await request(app)
    .post(`/archery-contest-api/users/profile/avatar`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/avatar.png')
    .expect(200);

  const user = await UserModel.findById(userOneId);

  expect(user.avatar).toEqual(expect.any(Buffer));
});
