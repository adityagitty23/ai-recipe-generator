// src/pages/RecipeResult.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import successAnimation from "../animations/Success.json";
import "../styles/RecipeResult.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


export default function RecipeResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const recipe = state?.recipe;
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("recipe_dark_mode");
    if (saved === "true") setDarkMode(true);
  }, []);

  const toggleTheme = () => {
    const mode = !darkMode;
    setDarkMode(mode);
    localStorage.setItem("recipe_dark_mode", mode.toString());
  };

  const saveRecipe = () => {
    const saved = JSON.parse(localStorage.getItem("saved_recipes") || "[]");
    saved.push(recipe);
    localStorage.setItem("saved_recipes", JSON.stringify(saved));
    alert("Recipe Saved Successfully! ⭐");
  };

  if (!recipe) {
    return (
      <div className="result-container">
        <h1>No recipe data found.</h1>
        <button className="result-btn" onClick={() => navigate("/recipe")}>
          Try Again
        </button>
      </div>
    );
  }

  const formatNutrition = (v) =>
    typeof v === "number" ? `${v.toFixed(1)} g` : v;

  const saveAndExport = async () => {
  // Save to localStorage
  const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
  savedRecipes.push(recipe);
  localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));

  // Generate PDF
  const capture = document.querySelector(".result-wrapper");

  html2canvas(capture, { scale: 2 }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${recipe.title}-recipe.pdf`);
  });

  alert("Recipe Saved & PDF Exported Successfully!");
};


  return (
    <div className={`result-wrapper ${darkMode ? "dark" : ""}`}>
      <header className="result-header">
        <h2 className="title">🍽 Your AI Recipe</h2>
        <button className="dark-toggle" onClick={toggleTheme}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <motion.div
        className="hero-animation"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Lottie animationData={successAnimation} loop={false} />
      </motion.div>

      {/* Recipe title and description */}
      <div className="card">
        <h2 className="section-title">{recipe.title}</h2>
        <p className="desc">{recipe.description}</p>
      </div>

      {/* Ingredients */}
      {!!recipe.ingredients?.length && (
        <div className="card">
          <h3>🛒 Ingredients</h3>
          <div className="ingredients-grid">
            {recipe.ingredients.map((item, index) => (
              <motion.div
                className="ingredient-card"
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <strong>{item.name}</strong>
                <p>
                  {item.quantity} {item.unit}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Steps */}
      {!!recipe.steps?.length && (
        <div className="card">
          <h3>👨‍🍳 Steps to Cook</h3>
          <ol className="steps-timeline">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="timeline-step">
                <span className="dot"></span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Nutrition Summary */}
      {recipe.nutrition && (
        <div className="card nutrition-box">
          <h3>📊 Nutrition Facts (approx.)</h3>
          <div className="nutrition-grid">
            <div className="nutri-item">
              <h4>Calories</h4>
              <p>{recipe.nutrition.calories} kcal</p>
            </div>
            <div className="nutri-item">
              <h4>Protein</h4>
              <p>{formatNutrition(recipe.nutrition.protein)}</p>
            </div>
            <div className="nutri-item">
              <h4>Carbs</h4>
              <p>{formatNutrition(recipe.nutrition.carbs)}</p>
            </div>
            <div className="nutri-item">
              <h4>Fats</h4>
              <p>{formatNutrition(recipe.nutrition.fat)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="btn-row">
        <button className="save-btn" onClick={saveAndExport}>
  ⭐ Save & Export PDF
</button>

        <button className="result-btn" onClick={() => navigate("/recipe")}>
          🔄 Generate Another
        </button>
      </div>
    </div>
  );
}
