// productSchema.js
const mongoose = require('mongoose');

// Define the Product schema
const productSchema = new mongoose.Schema({
    productImage: String, // Path or URL of the uploaded image
    productName: {
        type: String,
        required: true,
    },
    productId: {
        type: Number, // Change to Number
        required: true,
        unique: true, // Ensure uniqueness
    },
    productPrice: {
        type: Number,
        required: true,
    },
    productDetails: {
        type: String,
        required: true,
    }
});

// Create the Product model with an explicit collection name
const Product = mongoose.model('Product', productSchema, 'products');

module.exports = Product;
