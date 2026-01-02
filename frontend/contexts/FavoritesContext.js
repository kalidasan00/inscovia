// contexts/FavoritesContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, loading]);

  const addFavorite = (centerId) => {
    if (!favorites.includes(centerId)) {
      setFavorites([...favorites, centerId]);
    }
  };

  const removeFavorite = (centerId) => {
    setFavorites(favorites.filter(id => id !== centerId));
  };

  const toggleFavorite = (centerId) => {
    if (favorites.includes(centerId)) {
      removeFavorite(centerId);
    } else {
      addFavorite(centerId);
    }
  };

  const isFavorite = (centerId) => {
    return favorites.includes(centerId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        favoritesCount: favorites.length,
        loading
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}