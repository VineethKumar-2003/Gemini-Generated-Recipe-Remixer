// import React from 'react';
import './App.css';

function App() {
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
            <input id="cuisine" type="text" placeholder="Enter cuisine" />
          </div>
          <div className="input-group">
            <label htmlFor="difficulty">Level of Difficulty</label>
            <select id="difficulty">
              <option value="" disabled selected>
                Select difficulty level
              </option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="input-group">
            <label htmlFor="time">Preparation Time</label>
            <input id="time" type="text" placeholder="Enter preparation time" />
          </div>
          <div className="input-group">
            <label htmlFor="meal-type">Meal Type</label>
            <select id="meal-type">
              <option value="" disabled selected>
                Select meal type
              </option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
        </div>
        <div className="button-group">
          <button className="toggle-button active">Mixed</button>
          <div className="divider"></div>
          <button className="toggle-button">Veg</button>
          <div className="divider"></div>
          <button className="toggle-button">Non-Veg</button>
        </div>
        <button className="let-him-cook-btn">Let Him Cook</button>
      </main>
      <footer className="footer-left" />
      <footer className="footer-right" />
      <footer className="footer-connect" />
    </div>
  );
}

export default App;
