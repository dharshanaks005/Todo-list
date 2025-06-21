const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/todoapp';

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});

const todoSchema = new mongoose.Schema({
    user: String,
    title: String,
    done: Boolean,
});

const User = mongoose.model('User', userSchema);
const Todo = mongoose.model('Todo', todoSchema);

app.use(bodyParser.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
}));
app.use(express.static(path.join(__dirname, '../code')));

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(409).send("User already exists");

    await User.create({ username, password });
    res.sendStatus(200);
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
        return res.status(401).send("Invalid credentials");
    }

    req.session.user = username;
    res.sendStatus(200);
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => res.sendStatus(200));
});

function requireLogin(req, res, next) {
    if (!req.session.user) return res.status(401).send("Unauthorized");
    next();
}

app.get('/todos', requireLogin, async (req, res) => {
    const todos = await Todo.find({ user: req.session.user });
    res.json(todos);
});

app.post('/add', requireLogin, async (req, res) => {
    const todo = new Todo({
        user: req.session.user,
        title: req.body.title,
        done: false,
    });
    await todo.save();
    res.json(todo);
});

app.post('/toggle', requireLogin, async (req, res) => {
    const { id } = req.query;
    const todo = await Todo.findOne({ _id: id, user: req.session.user });
    if (!todo) return res.status(404).send("Todo not found");

    todo.done = !todo.done;
    await todo.save();
    res.json(todo);
});

app.post('/delete', requireLogin, async (req, res) => {
    const { id } = req.query;
    await Todo.deleteOne({ _id: id, user: req.session.user });
    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
