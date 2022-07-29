const express = require('express');
require('./db/mongoose');
const userRouter = require('./routes/user');
const contestRouter = require('./routes/contest');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/users', userRouter);
app.use('/api/contests', contestRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
