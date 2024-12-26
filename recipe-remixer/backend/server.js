const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(express.json()); // To parse incoming JSON requests
app.use(cors()); // To allow cross-origin requests from the frontend

// Gemini API key (replace with your actual API key)
const GEMINI_API_KEY = 'AIzaSyAQWaGNUH85ReFZ7vJvvpRPZKjwvfBmloo';

// Route to handle recipe requests
app.post('/recipe', async (req, res) => {
  const { preferredCuisine, levelOfDifficulty, preparationTime, mealType, dietaryPreference } = req.body;

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

    // Making request to Gemini API (assuming POST method)
    const response = await axios.post('https://gemini-api-url.com', requestPayload, {
      headers: {
        'Authorization': Bearer ${GEMINI_API_KEY},
        'Content-Type': 'application/json',
      },
    });

    // Sending the recipes back to frontend
    res.json({ recipes: response.data.recipes });

  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Error fetching recipes from Gemini API' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(Server is running on http://localhost:${port});
});