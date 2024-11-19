const mongoose = require('mongoose'); // Import mongoose

// Define the user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    cart: [
        {
            productId: Number,
            
        },
    ],
}, { collection: 'userdata' }); // Explicitly set collection name

// Create a model using the schema
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
