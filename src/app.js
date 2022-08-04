const express = require('express');
require('./db/mongoose');
const cors = require('cors');

const userRouter = require('./routes/user');
const contestRouter = require('./routes/contest');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/archery-contest-api/users', userRouter);
app.use('/archery-contest-api/contests', contestRouter);

module.exports = app;
