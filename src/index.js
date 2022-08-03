const express = require('express');
require('./db/mongoose');
const cors = require('cors');

const userRouter = require('./routes/user');
const contestRouter = require('./routes/contest');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/contests', contestRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is up on port ${port}`);
});
