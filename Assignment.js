// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/tasktracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Task Schema
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false }
});

const Task = mongoose.model('Task', taskSchema);

// Routes
// Create Task
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  const newTask = new Task({ title, description });
  try {
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Get All Tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tasks' });
  }
});

// Update Task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(id, { title, description, completed }, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete Task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Fetch tasks from the backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks')
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  }, []);

  // Handle task submission
  const handleAddTask = () => {
    axios.post('http://localhost:5000/api/tasks', { title, description })
      .then(response => {
        setTasks([...tasks, response.data]);
        setTitle('');
        setDescription('');
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });
  };

  // Handle task update
  const handleUpdateTask = (id, completed) => {
    axios.put(`http://localhost:5000/api/tasks/${id}`, { completed: !completed })
      .then(response => {
        setTasks(tasks.map(task => task._id === id ? response.data : task));
      })
      .catch(error => {
        console.error('Error updating task:', error);
      });
  };

  // Handle task deletion
  const handleDeleteTask = (id) => {
    axios.delete(`http://localhost:5000/api/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter(task => task._id !== id));
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  };

  return (
    <div>
      <h1>Task Tracker</h1>
      <div>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            <p>{task.title} - {task.description}</p>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleUpdateTask(task._id, task.completed)}
            />
            <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
