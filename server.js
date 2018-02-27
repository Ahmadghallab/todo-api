const express = require('express');
const bodyParser = require('body-parser');
const underscore = require('underscore');
const bcrypt = require('bcrypt');
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

  db.todo.destroy({
    where: {
      id: todoId
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
app.put('/todos/:id', (req, res) => {
  let todoId = parseInt(req.params.id);
  let body = underscore.pick(req.body, 'description', 'completed');
  let attributes = {};
  if(body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }
  if(body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }
  db.todo.findById(todoId).then((todo) => {
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
    let toPublicJSON = user.toJSON();
    res.json(underscore.pick(toPublicJSON, 'id', 'email', 'createdAt', 'updatedAt'));
  }, (e) => {
    res.status(400).json(e);
  });
});

// POST /users/login
app.post('/users/login', (req, res) => {
  let body = underscore.pick(req.body, 'email', 'password');

  if(typeof body.email !== 'string' || typeof body.password !== 'string') {
    return res.status(400).send();
  }

  db.user.findOne({
    where: {
      email: body.email
    }
  }).then((user) => {
    if(user) {
      if(bcrypt.compareSync(body.password, user.password_hash)) {
        res.json(user.toJSON());
      } else {
        return res.status(401).send();
      }
    } else {
      return res.status(401).send();
    }
  }, (e) => {
    res.status(500).send();
  });

});

db.sequelize.sync({force: true}).then(() => {
  app.listen(PORT, () => {
    console.log('Express listening on port' + PORT + '!');
  });
});
