// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./schema');

const app = express();
const port = 4000;

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/data', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connection is established'))
.catch(err => console.log('Error connecting to MongoDB:', err));

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.get('/', (req, res) => {
    res.send('one two three mic check check check');
});

app.post('/test', async (req, res) => {
    const { name, password } = req.body;
    console.log('Received name:', name);
    console.log('Received password:', password);

    const user = new User({ name, password });
    console.log('Created user instance:', user);

    try {
        await user.save();
        console.log('User saved successfully');
        res.status(201).json({ message: 'User created', user });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});

