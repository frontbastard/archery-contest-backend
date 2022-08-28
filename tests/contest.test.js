const request = require('supertest');
const app = require('../src/app');
const ContestModel = require('../src/models/contest.model');
const {
  userOne,
  userTwo,
  userMaster,
  contestUserOne,
  setupDatabase,
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
    });
  expect(response.body.success).toBeTruthy();
  const contest = await ContestModel.findById(response.body.data._id);
  expect(contest).not.toBeNull();
  expect(contest.hidden).toBeFalsy();
});

test('Should fetch contest', async () => {
  const response = await request(app)
    .get(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send();
  expect(response.body.success).toBeTruthy();
});

test('Should fetch other contest', async () => {
  const response = await request(app)
    .get(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send();
  expect(response.body.success).toBeTruthy();
});

test('Should fetch contests', async () => {
  const response = await request(app)
    .get('/archery-contest-api/contests?request={}')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send();
  expect(response.body.success).toBeTruthy();
  expect(response.body.data.items).toHaveLength(3);
});

test('Should fetch sorted contests', async () => {
  const response = await request(app)
    .get(
      '/archery-contest-api/contests?request={"sortTerm":"createdAt","sortAsc":"asc"}'
    )
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.success).toBeTruthy();
  expect(response.body.data.createdAt).toBe(contestUserOne.createdAt);
});

test('Should fetch limit/skip contests', async () => {
  const response = await request(app)
    .get('/archery-contest-api/contests?request={"pageIndex":1,"pageSize":1}')
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.success).toBeTruthy();
  expect(response.body.data.items[0]).toMatchObject(contestUserTwo);
});

test('Should update contest fields', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'Updated Description',
    });
  expect(response.body.success).toBeTruthy();
  const contest = await ContestModel.findById(response.body.data._id);
  expect(contest.description).toBe('Updated Description');
});

test('Should if master update other contest', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send({
      description: 'Changed description',
    });
  expect(response.body.success).toBeTruthy();
  const contest = await ContestModel.findById(contestUserOne._id);
  expect(contest).toMatchObject({ description: 'Changed description' });
});

test('Should not update other contest', async () => {
  const response = await request(app)
    .put(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send({
      description: 'Updated Description by user Two',
    });
  expect(response.body.success).toBeFalsy();
});

test('Should delete contest', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send();
  expect(response.body.success).toBeTruthy();
  const contest = await ContestModel.findById(contestUserOne._id);
  expect(contest).toBeNull();
});

test('Should not delete other contest', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send();
  expect(response.body.success).toBeFalsy();
});

test('Should if master delete contest', async () => {
  const response = await request(app)
    .delete(`/archery-contest-api/contests/${contestUserOne._id}`)
    .set('Authorization', `Bearer ${userMaster.tokens[0].token}`)
    .send();
  expect(response.body.success).toBeTruthy();
});
