const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Logging function
const logToFile = (message) => {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync('server.log', logMessage, 'utf8');
};

// Recipe Route
app.post('/recipe', async (req, res) => {
  const { preferredCuisine, levelOfDifficulty, preparationTime, mealType, dietaryPreference } = req.body;

  logToFile(`Received request: ${JSON.stringify(req.body)}`);

  // Check if all required fields are provided
  if (!preferredCuisine || !levelOfDifficulty || !preparationTime || !mealType || !dietaryPreference) {
    const errorMsg = 'All fields are required';
    logToFile(`Error: ${errorMsg}`);
    return res.status(400).json({ message: errorMsg });
  }

  try {
    // Construct the request prompt for multiple recipes
    const requestPrompt = `
    You are an AI recipe generator. Based on the following preferences, generate 3 to 5 recipes:
    Cuisine: ${preferredCuisine}
    Difficulty Level: ${levelOfDifficulty}
    Preparation Time: ${preparationTime}
    Meal Type: ${mealType}
    Dietary Preference: ${dietaryPreference}

    Return each recipe with the following structure:
    {
      "name": "Recipe Name",
      "yields": "Number of servings",
      "preparationTime": "Preparation time",
      "cookTime": "Cooking time",
      "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3", ...],
      "instructions": ["Step 1", "Step 2", "Step 3", ...]
    }

    Ensure the structure is consistent and well-formatted. Provide no extra information.
    `;

    const requestPayload = {
      contents: [{
        parts: [{
          text: requestPrompt
        }]
      }]
    };

    logToFile(`Sending request to Gemini API: ${JSON.stringify(requestPayload)}`);

    // Request to Gemini API
    const response = await axios.post(GEMINI_API_URL, requestPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    logToFile(`Received response from Gemini API: ${JSON.stringify(response.data)}`);

    // Check if the response contains valid recipe data
    if (response.data && response.data.candidates && response.data.candidates[0].content && response.data.candidates[0].content.parts[0].text) {
      let recipesText = response.data.candidates[0].content.parts[0].text;

      // Clean the response to remove unwanted JSON-like structure (i.e., remove code blocks)
      recipesText = recipesText.replace(/```json/g, '').replace(/```/g, '').trim(); // Remove code block markers

      // Split the response into individual recipes (assuming recipes are separated by double newlines)
      const recipeSections = recipesText.split(/\n{2,}/);
      const recipes = [];

      recipeSections.forEach((section, index) => {
        const recipe = {
          name: `Recipe ${index + 1}: [Name Unavailable]`,  // Default name if not found
          yields: 'Not available',
          preparationTime: 'Not available',
          cookTime: 'Not available',
          ingredients: [],
          instructions: []
        };

        const recipeLines = section.split('\n');

        // Loop through each line to classify them into the correct fields
        recipeLines.forEach(line => {
          // Try to extract specific fields from the lines
          if (line.toLowerCase().includes('yields')) {
            recipe.yields = line.replace(/.*yields[:\s]*/, '').trim();
          } else if (line.toLowerCase().includes('preparation time')) {
            recipe.preparationTime = line.replace(/.*preparation time[:\s]*/, '').trim();
          } else if (line.toLowerCase().includes('cook time')) {
            recipe.cookTime = line.replace(/.*cook time[:\s]*/, '').trim();
          } else if (line.toLowerCase().includes('ingredients')) {
            recipe.ingredients.push(line.replace(/.*ingredients[:\s]*/, '').trim());
          } else if (line.toLowerCase().includes('instructions')) {
            recipe.instructions.push(line.replace(/.*instructions[:\s]*/, '').trim());
          } else if (line.startsWith('*')) { // Ingredients lines (bulleted list)
            recipe.ingredients.push(line.trim());
          } else if (line.length > 0) { // General instructions or extra info
            recipe.instructions.push(line.trim());
          }
        });

        recipes.push(recipe);
      });

      // Return the array of recipes in JSON format
      logToFile(`Formatted recipes: ${JSON.stringify(recipes)}`);
      res.json({ recipes });
    } else {
      const errorMsg = 'No recipes found';
      logToFile(`Error: ${errorMsg}`);
      res.status(404).json({ message: errorMsg });
    }
  } catch (error) {
    const errorMsg = `Error fetching recipes: ${error.message}`;
    logToFile(`Error: ${errorMsg}`);
    console.error(errorMsg);
    res.status(500).json({ message: 'Error fetching recipes from Gemini API', error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  logToFile(`Server started on port ${port}`);
});
