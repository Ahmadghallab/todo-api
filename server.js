const express = require('express');
const bodyParser = require('body-parser');
const underscore = require('underscore');
const bcrypt = require('bcrypt');
const db = require('./db.js');
const middleware = require('./middleware.js')(db);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let todos = [];
let nextId = 1;


app.get('/', (req, res) => {
  res.send('Todo API Root');
});

// GET /todos
app.get('/todos', middleware.requireAuthentication, (req, res) => {
  let query = req.query;
  let where = {
    userId: req.user.get('id')
  };

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
app.get('/todos/:id', middleware.requireAuthentication, (req, res) => {
  const todoId = parseInt(req.params.id);

  db.todo.findOne({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }
  }).then((todo) => {
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
app.post('/todos', middleware.requireAuthentication, (req, res) => {
  const body = underscore.pick(req.body, 'description', 'completed');

  db.todo.create(body).then((todo) => {
    req.user.addTodo(todo).then(() => {
      return todo.reload();
    }).then((todo) => {
      res.json(todo.toJSON());
    });
  }, (e) => {
    res.status(400).json(e);
  });

});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, (req, res) => {
  let todoId = parseInt(req.params.id);

  db.todo.destroy({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }
  }).then((todosDelted) => {
    if(todosDelted === 0) {
      res.status(404).json({
        error: 'No todos with that id'
      });
    } else {
      res.status(202).send();
    }
  }, () => {
    res.status(500).send();
  })

});

// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, (req, res) => {
  let todoId = parseInt(req.params.id);
  let body = underscore.pick(req.body, 'description', 'completed');
  let attributes = {};
  if(body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }
  if(body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }
  db.todo.findOne({
    where: {
      id: todoId,
      userId: req.user.get('id')
    }
  }).then((todo) => {
    if(todo) {
      todo.update(attributes).then((todo) => {
        res.json(todo.toJSON());
      }, (e) => {
        res.status(400).json(e);
      });
    } else {
      res.status(404).send();
    }
  }, () => {
    res.status(500).send();
  });
});

// POST /users
app.post('/users', (req, res) => {
  let body = underscore.pick(req.body, 'email', 'password');
  db.user.create(body).then((user) => {
    res.json(user.toPublicJSON());
  }, (e) => {
    res.status(400).json(e);
  });
});

// POST /users/login
app.post('/users/login', (req, res) => {
  let body = underscore.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then((user) => {
    let token = user.generateToken('authentication');
    if(token) {
      res.header('Auth', token).json(user.toPublicJSON());
    } else {
      res.status(401).send();
    }
  }, () => {
    res.status(401).send();
  })

});

db.sequelize.sync({force: true}).then(() => {
  app.listen(PORT, () => {
    console.log('Express listening on port' + PORT + '!');
  });
});
