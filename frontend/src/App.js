import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RecipeForm from "./pages/RecipeForm";
import RecipeResult from "./pages/RecipeResult";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/recipe" />} />
        <Route path="/recipe" element={<RecipeForm />} />
        <Route path="/recipe/result" element={<RecipeResult />} />
      </Routes>
    </BrowserRouter>
  );
}
