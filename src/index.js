const express = require('express');
require('./db/mongoose');
const cors = require('cors');

const userRouter = require('./routes/user');
const contestRouter = require('./routes/contest');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use('/archery-contest-api/users', userRouter);
app.use('/archery-contest-api/contests', contestRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is up on port ${port}`);
});
