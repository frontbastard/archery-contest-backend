const express = require('express');
require('./db/mongoose');
const Contest = require('./models/contest');
const userRouter = require('./routers/user');
const contestRouter = require('./routers/contest');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(contestRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
