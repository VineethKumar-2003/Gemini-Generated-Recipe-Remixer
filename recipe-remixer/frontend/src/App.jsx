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
  const [recipes, setRecipes] = useState([]); 
  const [currentPage, setCurrentPage] = useState('form');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

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
        setRecipes(result || []); 
        setLoading(false);
        setCurrentPage('recipes');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error fetching recipes');
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

  const handleRecipeSelect = (recipe) => {
    setSelectedRecipe(recipe);
    setCurrentPage('recipe-detail');
  };

  if (currentPage === 'loading') {
    return (
      <div className="loading-screen">
        <h1>Gemini is Cooking...</h1>
        <p>&quot;Patience is the secret ingredient!&quot;</p>
        <div className="spinner"></div>
      </div>
    );
  }

  if (currentPage === 'recipe-detail') {
    return (
      <div className="recipe-detail-page">
        <div className="recipe-detail-container">
          <h1>{selectedRecipe.name}</h1>
          <div className="recipe-overview">
            <div className="recipe-stat">
              <span>Yields</span>
              <p>{selectedRecipe.yields}</p>
            </div>
            <div className="recipe-stat">
              <span>Prep Time</span>
              <p>{selectedRecipe.preparationTime}</p>
            </div>
            <div className="recipe-stat">
              <span>Cook Time</span>
              <p>{selectedRecipe.cookTime}</p>
            </div>
          </div>
          <div className="recipe-content">
            <div className="recipe-section">
              <h2>Ingredients</h2>
              <ul>
                {selectedRecipe.ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
            </div>
            <div className="recipe-section">
              <h2>Instructions</h2>
              <ol>
                {selectedRecipe.instructions.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
        <div className="navigation-buttons">
          <button 
            className="back-button"
            onClick={() => setCurrentPage('recipes')}
          >
            Back to Recipes
          </button>
          <button 
            className="back-button home-button"
            onClick={() => setCurrentPage('form')}
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }
  
  if (currentPage === 'recipes') {
    return (
      <div className="recipes-page">
        <h1>Recommended Recipes</h1>
        <div className="recipes-grid">
          {recipes && recipes.length > 0 ? (
            recipes.map((recipe, index) => (
              <div 
                key={index} 
                className="recipe-card"
                onClick={() => handleRecipeSelect(recipe)}
              >
                <h2>{recipe.name}</h2>
                <div className="recipe-card-details">
                  <p><span>Yields:</span> {recipe.yields}</p>
                  <p><span>Prep Time:</span> {recipe.preparationTime}</p>
                  <p><span>Cook Time:</span> {recipe.cookTime}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="no-recipes">No recipes found. Try adjusting your preferences.</p>
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
