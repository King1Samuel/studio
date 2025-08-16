const express = require('express');
const app = express();
const port = 9000;
const host = 'http://127.0.0.1:' + port;

app.listen(port, () => {
  console.log(`Example app listening at ${host}`);
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});