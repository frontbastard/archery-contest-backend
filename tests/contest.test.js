const request = require('supertest');
const app = require('../src/app');
const ContestModel = require('../src/models/Contest');
const {
  userOne,
  userTwo,
  userBlocked,
  userAdmin,
  contestUserOne,
  contestUserBlocked,
  setupDatabase,
  userOneId,
  contestUserTwo,
} = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create contest for user', async () => {
  const response = await request(app)
    .post('/archery-contest-api/contests')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Test contest name',
      description: 'Test contest description',
    })
    .expect(201);
  const contest = await ContestModel.findById(response.body._id);
  expect(contest).not.toBeNull();
  expect(contest.hidden).toBe(false);
});

test('Should fetch user contests', async () => {
  const response = await request(app)
    .get('/archery-contest-api/contests')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body).toHaveLength(1);
});

test('Should fetch user contest', async () => {
  await request(app)
    .get(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should fetch user contests', async () => {
  await request(app)
    .get(`/archery-contest-api/contests`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not fetch other user contest', async () => {
  await request(app)
    .get(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
});

test('Should if admin fetch hidden contests', async () => {
  const response = await request(app)
    .get('/archery-contest-api/contests?hidden=true')
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send()
    .expect(200);
  const visible = response.body.some((contest) => contest.hidden === false);
  expect(visible).toBe(false);
});

test('Should if admin fetch sorted contests', async () => {
  const response = await request(app)
    .get('/archery-contest-api/contests?sortBy=createdAt:desc')
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body.createdAt).toBe(contestUserOne.createdAt);
});

test('Should if admin fetch limit/skip contests', async () => {
  const response = await request(app)
    .get('/archery-contest-api/contests?limit=1&skip=1')
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send()
    .expect(200);
  expect(response.body[0]).toMatchObject(contestUserTwo);
});

test('Should if admin fetch other user contest', async () => {
  await request(app)
    .get(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should update valid contest fields', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Updated Description',
    })
    .expect(201);
  const contest = await ContestModel.findById(response.body._id);
  expect(contest.description).toBe('Updated Description');
});

test('Should not update invalid contest fields', async () => {
  await request(app)
    .put(`/archery-contest-api/contests/${userOneId}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      nonexistentField: 'Dummy Value',
    })
    .expect(400);
});

test('Should if admin update other user contest', async () => {
  await request(app)
    .put(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send({
      description: 'Changed description',
    })
    .expect(201);
});

test('Should not update other user contest', async () => {
  await request(app)
    .put(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
      description: 'Updated Description',
    })
    .expect(404);
  const contest = await ContestModel.findById(contestUserOne._id);
  expect(contest).not.toBeNull();
});

test('Should not update user contest being blocked', async () => {
  await request(app)
    .put(`/archery-contest-api/contests/${contestUserBlocked._id}`)
    .set('Authorization', `Bearer ${userBlocked.tokens[0].token}`)
    .send({
      description: 'Updated Description',
    })
    .expect(402);
  const contest = await ContestModel.findById(contestUserBlocked._id);
  expect(contest).not.toBeNull();
});

test('Should delete user contest', async () => {
  await request(app)
    .delete(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not delete other user contest', async () => {
  await request(app)
    .delete(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
  const contest = await ContestModel.findById(contestUserOne._id);
  expect(contest).not.toBeNull();
});

test('Should not delete user contest being blocked', async () => {
  await request(app)
    .delete(`/archery-contest-api/contests/${contestUserBlocked._id}`)
    .set('Authorization', `Bearer ${userBlocked.tokens[0].token}`)
    .send()
    .expect(402);
  const contest = await ContestModel.findById(contestUserBlocked._id);
  expect(contest).not.toBeNull();
});

test('Should if admin delete user contest', async () => {
  await request(app)
    .delete(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
    .send()
    .expect(200);
});