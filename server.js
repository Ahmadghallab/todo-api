const express = require('express');
const bodyParser = require('body-parser');
const underscore = require('underscore');
const db = require('./db.js');
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
  let query = req.query;
  let where = {};

  if(query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if(query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  }

  if(query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%' + query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then((todos) => {
    res.json(todos);
  }, (e) => {
    res.status(500).send();
  });

});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);

  db.todo.findById(todoId).then((todo) => {
    if(todo) {
      res.json(todo.toJSON())
    } else {
      res.status(404).send()
    }
  }, (e) => {
    res.status(500).json(e);
  })

});

// POST /todos
app.post('/todos', (req, res) => {
  const body = underscore.pick(req.body, 'description', 'completed');

  db.todo.create(body).then((todo) => {
    res.json(todo.toJSON());
  }, (e) => {
    res.status(400).json(e);
  });

});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  let todoId = parseInt(req.params.id);

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

db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log('Express listening on port' + PORT + '!');
  });
});
