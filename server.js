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

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  let todoId = parseInt(req.params.id);
  let matchedId = underscore.findWhere(todos, {id: todoId});

  if (!matchedId) {
    return res.status(404).json({"error": "no todos with that id"});
  } else {
    todos = underscore.without(todos, matchedId);
    return res.json(matchedId);
  }
});

// PUT /todos/:id
app.put('/todos/:id', (req, res) => {
  let todoId = parseInt(req.params.id);
  let matchedTodo = underscore.findWhere(todos, {id: todoId});
  let body = underscore.pick(req.body, 'description', 'completed');
  let validAttributes = {};

  if (!matchedTodo) {
    return res.status(404).send();
  }

  if(body.hasOwnProperty('completed') && underscore.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if(body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }

  if(body.hasOwnProperty('description') &&
    underscore.isString(body.description) &&
    body.description.trim().length > 0) {
    validAttributes.description = body.description;
  } else if(body.hasOwnProperty('description')) {
    return res.status(400).send()
  }

  underscore.extend(matchedTodo, validAttributes);
  res.json(matchedTodo)
})

app.listen(PORT, () => {
  console.log('Express listening on port ' + PORT + '!');
});
