const app = require('./app');

const port = process.env.PORT;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is up on port ${port}`);
});

module.exports = app;
