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

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;
const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`;

const restrictedWordsList = JSON.parse(fs.readFileSync('./api-filter/restrictedWords.json'));

const logToFile = (message) => {
  const logMessage = `${new Date().toISOString()} - ${message}\n`;
  fs.appendFileSync('server.log', logMessage, 'utf8');
};

const analyzeToxicity = async (text) => {
  try {
    const response = await axios.post(PERSPECTIVE_API_URL, {
      comment: { text },
      languages: ['en'],
      requestedAttributes: { TOXICITY: {} },
    }, {
      headers: { 'Content-Type': 'application/json' },
    });

    const toxicityScore = response.data.attributeScores.TOXICITY.summaryScore.value;
    return toxicityScore;
  } catch (error) {
    logToFile(`Error analyzing toxicity: ${error.message}`);
    return null;
  }
};

// Function to check if the text contains any restricted words
const containsRestrictedWords = (text) => {
  const matches = [];

  restrictedWordsList.forEach((word) => {
    const regex = new RegExp(`\\b${word.match}\\b`, 'gi');
    if (regex.test(text)) {
      matches.push({
        word: word.match,
        severity: word.severity,
        tags: word.tags,
      });
    }
  });

  return matches;
};

app.post('/api/recipe', async (req, res) => {
  const { preferredCuisine, levelOfDifficulty, preparationTime, mealType, dietaryPreference } = req.body;

  logToFile(`Received request: ${JSON.stringify(req.body)}`);

  const invalidCuisines = ["Canibalism", "Human Flesh", "Human", "Unethical"];
  if (!preferredCuisine || !levelOfDifficulty || !preparationTime || !mealType || !dietaryPreference) {
    const errorMsg = 'All fields are required';
    logToFile(`Error: ${errorMsg}`);
    return res.status(400).json({ message: errorMsg });
  }

  // Check for invalid cuisines based on restricted words
  const restrictedWordsInCuisine = containsRestrictedWords(preferredCuisine);
  if (restrictedWordsInCuisine.length > 0 || invalidCuisines.includes(preferredCuisine)) {
    const errorMsg = `The entered cuisine is restricted. Please enter a correct cuisine.`;
    logToFile(`Error: ${errorMsg} - Found: ${JSON.stringify(restrictedWordsInCuisine)}`);
    return res.status(400).json({ message: errorMsg });
  }

  if (invalidCuisines.includes(preferredCuisine)) {
    const errorMsg = `The entered cuisine is not valid. Please enter a correct cuisine.`;
    logToFile(`Error: ${errorMsg}`);
    return res.status(400).json({ message: errorMsg });
  }

  try {
    const toxicityScore = await analyzeToxicity(preferredCuisine);

    if (toxicityScore !== null && toxicityScore > 0.49) {
      const errorMsg = 'Please enter the correct cuisine';
      logToFile(`Input flagged as harmful: ${preferredCuisine}, toxicityScore: ${toxicityScore}`);
      return res.status(400).json({ message: errorMsg });
    }

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
    `;

    const requestPayload = { contents: [{ parts: [{ text: requestPrompt }] }] };

    logToFile(`Sending request to Gemini API: ${JSON.stringify(requestPayload)}`);

    const response = await axios.post(GEMINI_API_URL, requestPayload, {
      headers: { 'Content-Type': 'application/json' },
    });

    logToFile(`Gemini API response: ${JSON.stringify(response.data)}`);

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const rawText = response.data.candidates[0].content.parts[0].text;

      const cleanText = rawText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*\[/, '[')
        .replace(/\]\s*$/, ']')
        .trim();

      const recipes = JSON.parse(cleanText);

      if (!Array.isArray(recipes)) {
        throw new Error('Response is not in the correct array format');
      }

      const analyzedRecipes = await Promise.all(
        recipes.map(async (recipe) => {
          const instructionsText = recipe.instructions.join(' ');
          const toxicityScore = await analyzeToxicity(instructionsText);
          return {
            ...recipe,
            toxicityScore: toxicityScore !== null ? toxicityScore : 'Error analyzing toxicity',
          };
        })
      );

      res.json(analyzedRecipes); // Send response here
    } else {
      const errorMsg = 'Invalid response structure from Gemini API';
      logToFile(`Error: ${errorMsg}`);
      res.status(404).json({ message: errorMsg });
    }
  } catch (error) {
    logToFile(`Error fetching recipes: ${error.message}`);
    if (error.response) {
      logToFile(`Gemini API error response: ${JSON.stringify(error.response.data)}`);
    }
    res.status(500).json({
      message: 'Error fetching recipes from Gemini API',
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  logToFile(`Server started on port ${port}`);
});
