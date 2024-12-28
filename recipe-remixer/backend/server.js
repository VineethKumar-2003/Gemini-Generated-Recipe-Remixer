const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const fs = require("fs");

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Load API Key and URL from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Logging utility
const logToFile = (message) => {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync("server.log", logMessage, "utf8");
};

// POST route for generating recipes
app.post("/recipe", async (req, res) => {
  const { preferredCuisine, levelOfDifficulty, preparationTime, mealType, dietaryPreference } = req.body;

  // Log request payload
  logToFile(`Received request: ${JSON.stringify(req.body)}`);

  // Validate request body
  if (!preferredCuisine || !levelOfDifficulty || !preparationTime || !mealType || !dietaryPreference) {
    const errorMsg = "All fields are required";
    logToFile(`Error: ${errorMsg}`);
    return res.status(400).json({ message: errorMsg });
  }

  try {
    // Create the request prompt
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
    - Each field should be a simple string or array of strings
    - Generate 3-5 recipes maximum
    - For Every Generation the recipe should be unique
    `;

    const requestPayload = { contents: [{ parts: [{ text: requestPrompt }] }] };

    // Log request to Gemini API
    logToFile(`Sending request to Gemini API: ${JSON.stringify(requestPayload)}`);

    // Send request to Gemini API
    const response = await axios.post(GEMINI_API_URL, requestPayload, {
      headers: { "Content-Type": "application/json" },
    });

    // Parse response from Gemini API
    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const rawText = response.data.candidates[0].content.parts[0].text;

      try {
        // Clean and parse the response
        const cleanText = rawText
          .replace(/```json\n?/g, "") // Remove ```json
          .replace(/```\n?/g, "")     // Remove ```
          .replace(/^\s*\[/, "[")     // Trim whitespace before [
          .replace(/\]\s*$/, "]")     // Trim whitespace after ]
          .trim();

        const recipes = JSON.parse(cleanText);

        // Ensure the response is an array
        if (!Array.isArray(recipes)) {
          throw new Error("Response is not in the correct array format");
        }

        res.json(recipes);
      } catch (parseError) {
        // Log parsing error
        logToFile(`Error parsing JSON: ${parseError.message}\nRaw text: ${rawText}`);
        res.status(500).json({
          message: "Error parsing recipe data",
          error: parseError.message,
          rawResponse: rawText,
        });
      }
    } else {
      const errorMsg = "Invalid response structure from Gemini API";
      logToFile(`Error: ${errorMsg}`);
      res.status(404).json({ message: errorMsg });
    }
  } catch (error) {
    // Log general error
    logToFile(`Error fetching recipes: ${error.message}`);
    res.status(500).json({
      message: "Error fetching recipes from Gemini API",
      error: error.message,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  logToFile(`Server started on port ${port}`);
});

// Export app for serverless deployment
module.exports.handler = serverless(app);
