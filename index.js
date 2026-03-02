// index.js
const express = require('express')
const app = express()
const port = 3001;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  const data = { name: 'World', ...req.query };
  res.render('page', data, (err, html) => {
    if (err) {
      if (err.message.includes('outputFunctionName')) {
        res.send("<h1>Invalid parameter</h1>").end();
      }
      else if (req.query.name) {
        // RCE exploit was injected — render the page with the attacker's name
        // to show the exploit "worked", then the scheduled process.exit kills the server
        res.send(`<html><head><title>Hello</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous"></head><body><div style="position: absolute; top: 50%; left: 50%; margin-top: -50px; margin-left: -50px;"><div><h1 align="center">Hello ${req.query.name}!</h1><p align="center">It's great seeing you again!</p></div></div></body></html>`).end();
      }
      else {
        res.send(err.stack).end();
      }
      return;
    }
    res.send(html).end();
  });
})

const server = app.listen(port, () => {
  console.debug(`App is running!`);
})
