import { useState } from 'react';
import './App.css';

function App() {
  // State variables to store form data and recipes
  const [preferredCuisine, setPreferredCuisine] = useState('');
  const [levelOfDifficulty, setLevelOfDifficulty] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [mealType, setMealType] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('mixed');
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]); // To store recipes
  const [currentPage, setCurrentPage] = useState('form'); // Tracks the current page

  // Handle form submission
  const handleSubmit = async () => {
    if (!preferredCuisine || !levelOfDifficulty || !preparationTime || !mealType || !dietaryPreference) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    setCurrentPage('loading');

    const requestData = {
      preferredCuisine,
      levelOfDifficulty,
      preparationTime,
      mealType,
      dietaryPreference,
      limit: 5, // Limit to 5 recipes
    };

    try {
      const response = await fetch('http://localhost:5000/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        setRecipes(result.recipes || []);
        setLoading(false);
        setCurrentPage('recipes');
      } else {
        alert('Error fetching recipes');
        setLoading(false);
        setCurrentPage('form');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to the server');
      setLoading(false);
      setCurrentPage('form');
    }
  };

  if (currentPage === 'loading') {
    return (
      <div className="loading-screen">
        <h1>Gemini is Cooking...</h1>
        <p>"Patience is the secret ingredient!"</p>
      </div>
    );
  }

  if (currentPage === 'recipes') {
    return (
      <div className="recipes-page">
        <h1>Recommended Recipes</h1>
        <div className="recipes-container">
          {recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <div key={index} className="recipe-card">
                <img src={recipe.imageUrl} alt={recipe.name} className="recipe-image" />
                <h2 className="recipe-name">{recipe.name}</h2>
                <p className="recipe-time">Preparation Time: {recipe.time} minutes</p>
              </div>
            ))
          ) : (
            <p>No recipes found. Try adjusting your preferences.</p>
          )}
        </div>
        <button className="back-button" onClick={() => setCurrentPage('form')}>
          Back to Form
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="title-section">
          <h1 className="title">Gemini</h1>
          <p className="subtitle">1.5 Flash</p>
        </div>
      </header>
      <main className="main">
        <h1 className="main-title">Recipe Remixer</h1>
        <div className="input-container">
          <div className="input-group">
            <label htmlFor="cuisine">Preferred Cuisine</label>
            <input
              id="cuisine"
              type="text"
              placeholder="Enter cuisine"
              value={preferredCuisine}
              onChange={(e) => setPreferredCuisine(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="difficulty">Level of Difficulty</label>
            <select
              id="difficulty"
              value={levelOfDifficulty}
              onChange={(e) => setLevelOfDifficulty(e.target.value)}
            >
              <option value="" disabled>Select difficulty level</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="time">Preparation Time</label>
            <input
              id="time"
              type="text"
              placeholder="Enter preparation time"
              value={preparationTime}
              onChange={(e) => setPreparationTime(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="meal-type">Meal Type</label>
            <select
              id="meal-type"
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
            >
              <option value="" disabled>Select meal type</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
        </div>

        {/* Dietary Preference Buttons */}
        <div className="button-group">
          <button
            className={`toggle-button ${dietaryPreference === 'mixed' ? 'active' : ''}`}
            onClick={() => setDietaryPreference('mixed')}
          >
            Mixed
          </button>
          <div className="divider"></div>
          <button
            className={`toggle-button ${dietaryPreference === 'veg' ? 'active' : ''}`}
            onClick={() => setDietaryPreference('veg')}
          >
            Veg
          </button>
          <div className="divider"></div>
          <button
            className={`toggle-button ${dietaryPreference === 'non-veg' ? 'active' : ''}`}
            onClick={() => setDietaryPreference('non-veg')}
          >
            Non-Veg
          </button>
        </div>

        {/* Let Him Cook Button */}
        <button
          className="let-him-cook-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Cooking...' : 'Let Him Cook'}
        </button>
      </main>
      <footer className="footer-left" />
      <footer className="footer-right" />
      <footer className="footer-connect" />
    </div>
  );
}

export default App;
