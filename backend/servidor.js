const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const apiRouter = require('./api/api');

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`CORRIENDO SERVIDOR http://localhost:${port}`);
});
