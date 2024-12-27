import { useState } from 'react';
import './App.css';

function App() {
  // State variables to store form data and recipes
  const [preferredCuisine, setPreferredCuisine] = useState('');
  const [levelOfDifficulty, setLevelOfDifficulty] = useState('');
  const [preparationTime, setPreparationTime] = useState('');
  const [mealType, setMealType] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('mixed');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);  // To handle pagination
  const [totalPages, setTotalPages] = useState(1);  // To track total pages

  // Handle form submission
  const handleSubmit = async () => {
    if (!preferredCuisine || !levelOfDifficulty || !preparationTime || !mealType || !dietaryPreference) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);

    const requestData = {
      preferredCuisine,
      levelOfDifficulty,
      preparationTime,
      mealType,
      dietaryPreference,
      page,  // Include the current page in the request
      limit: 5,  // Limit to 5 recipes per page
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
        setRecipes(result.recipes);  // Save recipes to state
        setTotalPages(result.totalPages);  // Set total pages for pagination
      } else {
        alert('Error fetching recipes');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to the server');
    }

    setLoading(false);
  };

  // Handle page change for pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      handleSubmit();  // Refetch recipes for the new page
    }
  };

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

        {/* Display the recipes */}
        <div className="recipe-results">
          <h2>Recipes</h2>
          <ul>
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => (
                <li key={index}>
                  <h3>{recipe.name}</h3>
                  <p>{recipe.description}</p>
                </li>
              ))
            ) : (
              <p>No recipes available.</p>
            )}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <footer className="footer-left" />
      <footer className="footer-right" />
      <footer className="footer-connect" />
    </div>
  );
}

export default App;
