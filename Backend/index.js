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
    res.send('one two three mic check check check 1');
});

app.post('/test', async (req, res) => {
    const { name, password } = req.body;
    console.log('Received name:', name);
    console.log('Received password:', password);

    const entry = new User({ name, password });
    console.log('Created user instance:', entry);

    try {
        await entry.save();
        console.log('User saved successfully');
        res.status(201).json({ message: 'User created', entry });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// User login endpoint
app.post('/login', async (req, res) => {
    const { name, password } = req.body;

    try {
        // to find the user in the database
        const user = await User.findOne({ name, password });

        if (user) {
            // If user exists, respond with status 420
            res.status(200).json({ message: 'User exists' , username: name});
        } else {
            
            res.status(401).json({ message: 'User not found or incorrect credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});

