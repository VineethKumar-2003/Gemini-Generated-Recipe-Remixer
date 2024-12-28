const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const logToFile = (message) => {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync('server.log', logMessage, 'utf8');
};

app.post('/recipe', async (req, res) => {
  const { preferredCuisine, levelOfDifficulty, preparationTime, mealType, dietaryPreference } = req.body;

  logToFile(`Received request: ${JSON.stringify(req.body)}`);

  if (!preferredCuisine || !levelOfDifficulty || !preparationTime || !mealType || !dietaryPreference) {
    const errorMsg = 'All fields are required';
    logToFile(`Error: ${errorMsg}`);
    return res.status(400).json({ message: errorMsg });
  }

  try {
    const requestPrompt = `
    Generate ${preferredCuisine} recipes based on these preferences:
    - Difficulty: ${levelOfDifficulty}
    - Preparation Time: ${preparationTime}
    - Meal Type: ${mealType}
    - Dietary Preference: ${dietaryPreference}

    Return the response as a JSON array of recipes. Each recipe should have this exact structure:
    [
      {
        "name": "Recipe Name",
        "yields": "Number of servings",
        "preparationTime": "Preparation time",
        "cookTime": "Cooking time",
        "ingredients": [
          "ingredient 1",
          "ingredient 2"
        ],
        "instructions": [
          "step 1",
          "step 2"
        ]
      }
    ]

    Important: 
    - Return ONLY the JSON array
    - Do NOT include any markdown formatting or comments
    - Do NOT wrap the response in quotes or code blocks
    - Each field should be a simple string or array of strings
    - Generate 3-5 recipes maximum
    - Every Generation Should be Unique
    `;

    const requestPayload = { contents: [{ parts: [{ text: requestPrompt }] }] };

    logToFile(`Sending request to Gemini API: ${JSON.stringify(requestPayload)}`);

    const response = await axios.post(GEMINI_API_URL, requestPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    // Log the response for debugging
    logToFile(`Gemini API response: ${JSON.stringify(response.data)}`);

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const rawText = response.data.candidates[0].content.parts[0].text;
      
      try {
        // Clean the response text
        const cleanText = rawText
          .replace(/```json\n?/g, '') // Remove ```json
          .replace(/```\n?/g, '')     // Remove ```
          .replace(/^\s*\[/, '[')     // Remove leading whitespace before [
          .replace(/\]\s*$/, ']')     // Remove trailing whitespace after ]
          .trim();

        // Parse the cleaned JSON
        const recipes = JSON.parse(cleanText);
        
        // Ensure we have an array
        if (!Array.isArray(recipes)) {
          // If we got an object with a recipes array, return just the array
          if (recipes.recipes && Array.isArray(recipes.recipes)) {
            res.json(recipes.recipes);
          } else {
            throw new Error('Response is not in the correct array format');
          }
        } else {
          res.json(recipes);
        }
      } catch (parseError) {
        logToFile(`Error parsing JSON: ${parseError.message}\nRaw text: ${rawText}`);
        res.status(500).json({ 
          message: 'Error parsing recipe data', 
          error: parseError.message,
          rawResponse: rawText 
        });
      }
    } else {
      const errorMsg = 'Invalid response structure from Gemini API';
      logToFile(`Error: ${errorMsg}`);
      res.status(404).json({ message: errorMsg });
    }
  } catch (error) {
    logToFile(`Error fetching recipes: ${error.message}`);
    // Log the full error response for debugging
    if (error.response) {
      logToFile(`Gemini API error response: ${JSON.stringify(error.response.data)}`);
    }
    res.status(500).json({ 
      message: 'Error fetching recipes from Gemini API', 
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  logToFile(`Server started on port ${port}`);
});
