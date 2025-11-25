// src/pages/RecipeForm.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { motion } from "framer-motion";
import chefAnimation from "../animations/chef.json";
import loadingAnimation from "../animations/loading.json";
import "../styles/RecipeForm.css";

export default function RecipeForm() {
  const [mode, setMode] = useState("text"); // "text" | "image"
  const [ingredients, setIngredients] = useState("");
  const [cuisine, setCuisine] = useState("Any");
  const [diet, setDiet] = useState("Any");
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageHint, setImageHint] = useState("");

  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  // Auto-select backend: local vs deployed
  const API_BASE =
    window.location.hostname === "localhost"
      ? "http://127.0.0.1:5000"
      : "https://your-backend-url.onrender.com";

  // Dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recipe_dark_mode");
    if (saved === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("recipe_dark_mode", darkMode ? "true" : "false");
  }, [darkMode]);

  function handleDarkToggle() {
    setDarkMode((prev) => !prev);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  async function generateRecipe() {
    if (mode === "text" && !ingredients.trim()) {
      alert("Please enter some ingredients.");
      return;
    }

    if (mode === "image" && !imageFile) {
      alert("Please upload or capture a food image.");
      return;
    }

    setLoading(true);

    try {
      let payload = {
        ingredients:
          mode === "text"
            ? ingredients
            : imageHint || "Dish from uploaded food image",
        cuisine,
        diet,
        servings,
      };

      // If image mode, also send base64 so backend can use it later (if vision model enabled)
      if (mode === "image" && imageFile) {
        const base64 = await fileToBase64(imageFile);
        payload.imageBase64 = base64;
      }

      const res = await fetch(`${API_BASE}/api/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) {
        console.error("API error:", data);
        alert("Failed to generate recipe. Please try again.");
      } else {
        navigate("/recipe/result", { state: { recipe: data } });
      }
    } catch (error) {
      console.error("Request error:", error);
      alert("Something went wrong. Check backend / network.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`recipe-app ${darkMode ? "dark" : ""}`}>
      <header className="top-bar">
        <h2 className="logo">AI Recipe Lab 🍳</h2>
        <button className="dark-toggle" onClick={handleDarkToggle}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </header>

      <div className="recipe-container">
        {/* Left Lottie */}
        <motion.div
          className="left-section"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Lottie
            animationData={chefAnimation}
            loop
            className="chef-animation"
          />
        </motion.div>

        {/* Right Panel */}
        <motion.div
          className="right-section"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="title">AI Recipe Generator</h1>
          <p className="subtitle">
            Turn your ingredients or food photo into a smart recipe with
            calories, protein, carbs & fat.
          </p>

          {/* Mode Tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${mode === "text" ? "active" : ""}`}
              onClick={() => setMode("text")}
            >
              ✍️ Type Ingredients
            </button>
            <button
              className={`tab-btn ${mode === "image" ? "active" : ""}`}
              onClick={() => setMode("image")}
            >
              📷 Upload / Capture Food
            </button>
          </div>

          {loading ? (
            <div className="loading-box">
              <Lottie
                animationData={loadingAnimation}
                loop
                className="loading-lottie"
              />
              <p>Cooking your recipe...</p>
            </div>
          ) : (
            <>
              {mode === "text" && (
                <>
                  <label className="field-label">
                    Ingredients (comma separated)
                  </label>
                  <textarea
                    className="input textarea"
                    placeholder="Example: rice, tomato, onion, oil, spices"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                  />
                </>
              )}

              {mode === "image" && (
                <div className="image-mode">
                  <label className="field-label">Upload / Capture Food</label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="input file-input"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="image-preview-box">
                      <img
                        src={imagePreview}
                        alt="Food preview"
                        className="image-preview"
                      />
                    </div>
                  )}

                  <label className="field-label">
                    What is this dish / ingredients? (helps AI)
                  </label>
                  <textarea
                    className="input textarea"
                    placeholder="Example: plate with rice, dal, salad, roti"
                    value={imageHint}
                    onChange={(e) => setImageHint(e.target.value)}
                  />
                </div>
              )}

              {/* Common fields */}
              <div className="row">
                <div className="field">
                  <label className="field-label">Cuisine</label>
                  <select
                    className="input"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                  >
                    <option>Any</option>
                    <option>Indian</option>
                    <option>Italian</option>
                    <option>Chinese</option>
                    <option>Mexican</option>
                    <option>Continental</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Diet Type</label>
                  <select
                    className="input"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                  >
                    <option>Any</option>
                    <option>Vegetarian</option>
                    <option>Vegan</option>
                    <option>Non-Veg</option>
                    <option>High Protein</option>
                    <option>Low Carb</option>
                  </select>
                </div>

                <div className="field">
                  <label className="field-label">Servings</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={servings}
                    onChange={(e) =>
                      setServings(parseInt(e.target.value || "1", 10))
                    }
                  />
                </div>
              </div>

              <button
                className="generate-btn"
                onClick={generateRecipe}
                disabled={loading}
              >
                🍳 Generate Recipe
              </button>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
