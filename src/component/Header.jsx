import React, { useState, useEffect } from "react";

const RecipeFinder = () => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(""); 
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
  const fetchRecipeDetails = async (idMeal) => {
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`
      );
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      return null;
    }
  };

  
  useEffect(() => {
    const fetchRandomRecipes = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recipes");
        }

        const data = await response.json();
        if (data.meals) {
          const detailedMeals = await Promise.all(
            data.meals.map((meal) => fetchRecipeDetails(meal.idMeal))
          );
          setAllRecipes(detailedMeals);
          setRecipes(detailedMeals);
        } else {
          setError("No recipes found");
        }
      } catch (error) {
        setError("Error fetching recipes. Please try again.");
      }
      setLoading(false);
    };

    fetchRandomRecipes();
  }, []);

 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/categories.php`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data.categories); 
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

 
  const fetchRecipes = async (query) => {
    setLoading(true);
    setError("");
    try {
      let response;
      if (filter) {
       
        response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${filter}`
        );
      } else {
        
        response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
        );
      }

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();

      if (data.meals) {
        const detailedMeals = await Promise.all(
          data.meals.map((meal) => fetchRecipeDetails(meal.idMeal))
        );
        setRecipes(detailedMeals);
      } else {
        setError("No recipes found");
      }
    } catch (error) {
      setError("Error fetching recipes. Please try again.");
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query || filter) {
      fetchRecipes(query);
    } else {
      setRecipes(allRecipes);
    }
  };

  return (
    <div className="min-h-screen bg-[#A3C16E] p-6">
      <h1 className="text-5xl font-bold text-center text-[#2B2D42]">
        Recipe Finder
      </h1>

      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row items-center w-full justify-evenly mt-8 p-4 gap-8"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for recipes"
          className="p-3 border border-gray-300  rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B2D42]"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-3  border-gray-300 rounded-md w-full md:w-1/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B2D42]"
        >
          <option value="">Filter by category</option>
          {categories.map((category) => (
            <option key={category.idCategory} value={category.strCategory}>
              {category.strCategory}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="relative h-[50px] w-full  md:w-1/3 overflow-hidden rounded-md bg-white text-black shadow-2xl transition-all before:absolute before:left-0 before:right-0 before:top-0 before:h-0 before:w-full before:bg-[#c8fd6e] before:duration-300 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0 after:w-full after:bg-[#c8fd6e] after:duration-500 hover:text-black hover:shadow-[#fcc191ac] hover:before:h-2/4 hover:after:h-2/4"
        >
          <span className="relative z-10">Search</span>
        </button>
      </form>

      {loading && <p className="text-center text-lg">Loading...</p>}
      {error && <p className="text-center text-[#2B2D42]">{error}</p>}

      {!loading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 p-2">
          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-[#F4F1DE]"
            >
              <img
                src={recipe.strMealThumb}
                alt={recipe.strMeal}
                className="h-40 w-full mb-12 object-cover rounded-lg capitalize hover:scale-[1.05]"
              />
              <div className="p-2">
                <h3 className="mt-2 text-lg font-bold text-[#2B2D42]">
                  {recipe.strMeal}
                </h3>
                <p className="text-[#2B2D42] font-semibold">
                  Category: {recipe.strCategory}
                </p>
                <a
                  href={recipe.strSource || `https://www.themealdb.com/meal/${recipe.idMeal}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2B2D42] italic hover:text-zinc-500 mt-2 block"
                >
                  View Recipe
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeFinder;
