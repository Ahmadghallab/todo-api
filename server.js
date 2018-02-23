const express = require('express');
const bodyParser = require('body-parser');
const underscore = require('underscore');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let todos = [];
let nextId = 1;


app.get('/', (req, res) => {
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', (req, res) => {
  res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);

  let matchedId = underscore.findWhere(todos, {id: todoId});

  if (matchedId) {
    res.json(matchedId);
  } else {
    res.status(404).send();
  }
});

// POST /todos
app.post('/todos', (req, res) => {
  const body = req.body;

  if (underscore.isEmpty(body.description)) {
    return res.status(400).send();
  }

  body.id = nextId++;
  todos.push(body);
  res.json(body);
});

app.listen(PORT, () => {
  console.log('Express listening on port ' + PORT + '!');
});
