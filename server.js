const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let todos = [
  {
    id: 1,
    description: 'Meet mom for lunch',
    completed: false
  },
  {
    id: 2,
    description: 'Go to market',
    completed: false
  },
  {
    id: 3,
    description: 'Feed the cat',
    completed: true
  }
];

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
  let matchedId;

  todos.forEach((todo) => {
    if (todoId === todo.id) {
      matchedId = todo;
    }
  });

  if (matchedId) {
    res.json(matchedId);
  } else {
    res.status(404).send();
  }
});

app.listen(PORT, () => {
  console.log('Express listening on port ' + PORT + '!');
});
