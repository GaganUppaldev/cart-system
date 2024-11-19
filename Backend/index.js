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


// Middleware to serve static files from 'uploads' directory
app.use('/uploads', express.static('uploads'));


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
    //to save .jpg file location properly 
    const productImage = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;

    const newProduct = new Product({
        productImage,
        productName,
        productId,
        productPrice: parseFloat(productprice),
        productDetails,
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

app.get('/product-load', async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products
        const modifiedProducts = products.map(product => ({
            ...product.toObject(),
            // Ensure productId remains as a number
        }));
        res.status(200).json(modifiedProducts); // Return modified product data
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).json({ message: 'Error loading products' });
    }
});


app.post('/add-to-cart', async (req, res) => {
    const { productId } = req.body; // Extract productId as a number
    const username = req.headers['username']; // Extract username from headers

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    if (productId === undefined) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ name: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the product is already in the cart
        const isProductInCart = user.cart.some(item => item.productId === productId);
        if (!isProductInCart) {
            user.cart.push({ productId }); // Add productId to cart
            await user.save(); // Save updated user document
        }

        res.status(200).json({ message: 'Product added to cart successfully', cart: user.cart });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'Failed to add product to cart', error });
    }
});

/*
app.get('/cart-details', async (req, res) => {
    const username = req.query.username; // Extract username from query params

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ name: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract productIds from the user's cart
        const productIds = user.cart.map(item => item.productId);

        // Query the Product collection to get details of the products in the cart
        const products = await Product.find({ productId: { $in: productIds } });

        res.status(200).json(products); // Return the product details
    } catch (error) {
        console.error('Error fetching cart details:', error);
        res.status(500).json({ message: 'Failed to load cart details' });
    }
});*/

// API 1: Fetch user cart by username
app.post('/user-cart', async (req, res) => {
    try {
      const { username } = req.body; // Get username from the client request
      const user = await User.findOne({ name: username }); // Find user by username
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' }); // Handle user not found
      }
  
      res.json({ cart: user.cart }); // Respond with user's cart
    } catch (error) {
      console.error('Error fetching user cart:', error);
      res.status(500).json({ message: 'Server error' }); // Handle server error
    }
  });
  
  // API 2: Fetch product details by product IDs
  app.post('/product-details', async (req, res) => {
    try {
      const { productIds } = req.body; // Get product IDs from the client request
      const products = await Product.find({ productId: { $in: productIds } }); // Find products by IDs
  
      if (!products.length) {
        return res.status(404).json({ message: 'Products not found' }); // Handle no products found
      }
  
      res.json(products); // Respond with product details
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).json({ message: 'Server error' }); // Handle server error
    }
  });




app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});
