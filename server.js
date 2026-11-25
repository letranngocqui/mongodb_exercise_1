const http = require('http');
const { handleRequest } = require('./router');
const dataSource = require('./data_source');

const PORT = 3000;

async function main() {
  await dataSource.connect();
  console.log(`Connected to MongoDB: ${dataSource.getDb().databaseName}`);

  http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Cannot start server:', err.message);
  process.exit(1);
});
