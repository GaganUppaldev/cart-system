// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // Add multer for file uploads

const User = require('./schema');
const Product = require('./productSchema'); // Import Product schema

const app = express();
const port = 4000;

app.use(express.json());

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save files to an 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(new Error('Only .jpg or .jpeg files are allowed!'), false);
        }
    },
});

mongoose.connect('mongodb://localhost:27017/data', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connection is established'))
.catch(err => console.log('Error connecting to MongoDB:', err));

app.use(cors({
    origin: 'http://localhost:3000'
}));

// Define the /product-list endpoint
app.post('/product-list', upload.single('productImage'), async (req, res) => {
    const { productName, productId, productprice, productDetails } = req.body;
    const productImage = req.file ? req.file.path : null;

    const newProduct = new Product({
        productImage: productImage,
        productName: productName,
        productId: productId,
        productPrice: parseFloat(productprice),
        productDetails: productDetails,
    });

    try {
        await newProduct.save();
        res.status(200).json({ message: 'Product created successfully', newProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
});

app.get('/', (req, res) => {
    res.send('one two three mic check check check 1');
});

app.post('/test', async (req, res) => {
    const { name, password } = req.body;

    const entry = new User({ name, password });

    try {
        await entry.save();
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
        const user = await User.findOne({ name, password });

        if (user) {
            res.status(200).json({ message: 'User exists', username: name });
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
