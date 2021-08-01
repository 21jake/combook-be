require('dotenv').config({ path: './config.env' });
const app = require('./app');

process.on('uncaughtException', (err) => {
  const { name, message } = err;
  console.log(`${name}: ${message}`);
  console.error(`UNCAUGHT EXCEPTION 💥💥 SHUTTING DOWN `);
  process.exit(1);
});

const mongoose = require('mongoose');

const { DB_REMOTE, DB_REMOTE_PASSWORD, DB_LOCAL, PORT } = process.env;

const DB = DB_REMOTE.replace('<PASSWORD>', DB_REMOTE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => console.log('Successfully connected to DB'))
  .catch((err) => console.log(`Error in connecting to DB: ${err}`));

const port = PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  const { name, message } = err;
  console.error(`UNHANDLED REJECTION 💥💥 SHUTTING DOWN `);
  console.log(`${name}: ${message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated 💥💥');
  });
});
