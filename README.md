# Recipe Remixer App
A modern web application that uses Gemini AI to generate personalized recipe recommendations. Users input ingredients or meal preferences, and the AI provides multiple recipe variations, from simple home-style dishes to more elaborate gourmet options. The app is designed to be intuitive, offering step-by-step instructions and allowing users to filter based on dietary preferences or cooking skill levels. Built with React and Vite for the frontend, and Express for the backend, the application ensures fast, responsive performance.

## Table of Contents
- [Features](#features)
- [Tech Stack](#text-stack)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Endpoints](#api-endpoints)
  - [POST /api/recipe](post-/recipe)
    - [Recipe Body](#recipe-body)
    - [Example](#example)
    - [Response](#response)
- [Error Handling](#error-handling)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [Future Contributions](#future-contributions)

## Features
- **Personalized Recipe Generation**: Get unique recipes based on:
  - Cuisine preference
  - Difficulty level
  - Preparation time
  - Meal type (breakfast, lunch, dinner, snack)
  - Dietary preferences (mixed, vegetarian, non-vegetarian)

- **Interactive UI**:
  - Modern, responsive design
  - Smooth transitions and loading states
  - Detailed recipe cards with preparation details
  - Clean and intuitive recipe viewing interface

- **Recipe Details**:
  - Comprehensive ingredient lists
  - Step-by-step instructions
  - Preparation and cooking times
  - Serving size information

## Tech Stack

- **Frontend**:
  - React.js + Vite.js
  - CSS with modern animations and transitions

- **Backend**:
  - Node.js with Express
  - Google's Gemini 1.5 Flash AI API
  - Error logging system

## Setup

### Prerequisites
- Node.js (latest stable version)
- NPM or Yarn
- Google Cloud account with Gemini API access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/VineethKumar-2003/Gemini-Generated-Recipe-Remixer.git
cd recipe-remixer
```

2. Install dependencis:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Configure environment variables:
Create a `.env` file in the backend directory:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the Application:
```bash
# Start backend server (from backend directory)
npm run start-dev

# Start frontend development server (from frontend directory)
npm start dev
```
The application will be available at http://localhost:5173, with the backend running on http://localhost:5000.

## API Endpoints

### POST /api/recipe
Generate recipe recommendations based on user preferences.

#### Recipe Body:
```bash
{
  "preferredCuisine": "string",
  "levelOfDifficulty": "string",
  "preparationTime": "mixed",
  "mealType": "string",
  "dietaryPreference": "string"
}
```

#### Example:
```bash
{
  "preferredCuisine": "Indian",
  "levelOfDifficulty": "Medium",
  "preparationTime": "10 - 60 minutes",
  "mealType": "Breakfast",
  "dietaryPreference": "Vegetarian"
}
```

#### Response:
```bash
[
  {
    "name": "Recipe Name",
    "yields": "Number of servings",
    "preparationTime": "Preparation time",
    "cookTime": "Cooking time",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "instructions": ["step 1", "step 2"]
  }
]
```

## Error Handling
The application includes comprehensive error handling:

- Input validation
- API error management
- Response parsing validation
- Detailed error logging system

## Future Enhancements

- User accounts and recipe saving
- Social sharing features
- Recipe rating system
- Advanced filtering options
- Metric/Imperial unit conversion

## Contributors

1. [Shanttoosh V](https://www.linkedin.com/in/shanttoosh-v-470484289/)
2. [Vineeth Kumar G](https://www.linkedin.com/in/vineeth-kumar-b1485b2a0/)
3. [Vishwa Moorthy S](https://www.linkedin.com/in/vishwa-moorthy-s-0006492a0/)

## Future Contributions:
We welcome developers to check out and improve this project. Here's how you can get started:

1. **Clone the Repository:**
```bash
git clone https://github.com/VineethKumar-2003/Gemini-Generated-Recipe-Remixer.git
```

2. **Set Up the Project** : Follow the setup instructions in the documentation to run the frontend and backend locally.

3. **Understand the Architecture** : Explore the `React+Vite` frontend and Express backend codebases to familiarize yourself with the structure.

4. **Add Features or Fix Bugs** : We're always looking for enhancements! Whether it's optimizing performance, fixing bugs, or adding new features, your contributions are welcome.

### Guidelines for Contributors:
- Follow proper code formatting and use consistent naming conventions.
- Add comments where necessary for readability.
- Test thoroughly before submitting a pull request.

Feel free to reach out for any assistance or guidance.


