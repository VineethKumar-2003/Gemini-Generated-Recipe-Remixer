const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();  // To load environment variables from .env file

const app = express();
const port = 5000;

// Middleware
app.use(express.json()); // To parse incoming JSON requests
app.use(cors()); // To allow cross-origin requests from the frontend

// Gemini API key (secure the key using environment variables)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure you add the API key to your .env file

// Gemini API URL (replace with the actual URL of the Gemini API)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}'; // Replace this with the correct endpoint

// Route to handle recipe requests
app.post('/recipe', async (req, res) => {
  const { preferredCuisine, levelOfDifficulty, preparationTime, mealType, dietaryPreference } = req.body;

  // Check if all required fields are provided
  if (!preferredCuisine || !levelOfDifficulty || !preparationTime || !mealType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Constructing the request to Gemini API
    const requestPayload = {
      cuisine: preferredCuisine,
      difficulty: levelOfDifficulty,
      time: preparationTime,
      meal: mealType,
      diet: dietaryPreference,
    };

    // Making request to Gemini API
    const response = await axios.post(GEMINI_API_URL, requestPayload, {
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`, // Authorization header with the API key
        'Content-Type': 'application/json',
      },
    });

    // Sending the recipes back to frontend
    if (response.data.recipes) {
      res.json({ recipes: response.data.recipes });
    } else {
      res.status(404).json({ message: 'No recipes found' });
    }

  } catch (error) {
    console.error('Error fetching recipes:', error.message || error);
    res.status(500).json({ message: 'Error fetching recipes from Gemini API', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`); // Logs server URL
});
