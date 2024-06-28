import * as SQLite from "expo-sqlite";

const DEFAULT_CATEGORY_IMAGE = "../images/category_placeholder.jpg";
const defaultImage = require("../images/category_placeholder.jpg");

async function initDB() {
  try {
    //await resetDatabase(); // Ensure this completes before proceeding
    const db = await SQLite.openDatabaseAsync("recipes.db");

    // Set journal mode to Write-Ahead Logging
    await db.runAsync(`PRAGMA journal_mode = WAL;`);

    // Create the recipes table
    try {
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          ingredients TEXT NOT NULL,
          instructions TEXT NOT NULL,
          image TEXT,
          totalTime TEXT
        );
      `);
      console.log("Recipes table created successfully");
    } catch (error) {
      console.error("Error creating recipes table:", error);
    }

    // Create the categories table
    try {
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL UNIQUE,
          image TEXT DEFAULT '${DEFAULT_CATEGORY_IMAGE}'
        );
      `);
      console.log("Categories table created successfully");
    } catch (error) {
      console.error("Error creating categories table:", error);
    }

    // Create the recipe_categories table
    try {
      await db.runAsync(`
        CREATE TABLE IF NOT EXISTS recipe_categories (
          recipeId INTEGER,
          categoryId INTEGER,
          PRIMARY KEY (recipeId, categoryId),
          FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
        );
      `);
      console.log("Recipe_categories table created successfully");
    } catch (error) {
      console.error("Error creating recipe_categories table:", error);
    }

    // Insert the default category
    try {
      await db.runAsync(
        `
        INSERT OR IGNORE INTO categories (name, image) VALUES (?, ?);
    `,
        ["מועדפים"]
      );
      console.log("Default category inserted successfully");
    } catch (error) {
      console.error("Error inserting default category:", error);
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

async function fetchAllRecipes() {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    const rows = await db.getAllAsync("SELECT * FROM recipes;");
    return rows;
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

async function fetchRecipeById(id) {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    const row = await db.getFirstAsync(
      `
      SELECT r.*, GROUP_CONCAT(c.name) AS categoryNames 
      FROM recipes r
      LEFT JOIN recipe_categories rc ON r.id = rc.recipeId
      LEFT JOIN categories c ON rc.categoryId = c.id
      WHERE r.id = ?
      GROUP BY r.id;
    `,
      [id]
    );
    return row;
  } catch (error) {
    console.error("Error fetching recipe with ID:", id, error);
  }
}

//update recipe

async function deleteRecipeById(id) {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    await db.runAsync("DELETE FROM recipes WHERE id = ?;", [id]);
    console.log("Recipe deleted successfully");
  } catch (error) {
    console.error("Failed to delete recipe:", error);
  }
}

async function fetchAllCategories() {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    const rows = await db.getAllAsync(
      "SELECT id, name, image FROM categories;"
    );
    return rows;
  } catch (error) {
    console.error("Failed to fetch categories", error);
  }
}

async function insertCategory(name, image = DEFAULT_CATEGORY_IMAGE) {
  const db = await SQLite.openDatabaseAsync("recipes.db");
  try {
    const existingCategory = await db.getFirstAsync(
      "SELECT id FROM categories WHERE name = ?",
      [name]
    );
    if (existingCategory) {
      console.log("Category already exists:", name, "ID:", existingCategory.id);
      return { success: true, id: existingCategory.id };
    }

    const result = await db.runAsync(
      "INSERT INTO categories (name, image) VALUES (?, ?);",
      [name, image]
    );
    if (result.lastInsertRowId) {
      console.log(
        "New category inserted:",
        name,
        "ID:",
        result.lastInsertRowId
      );
      return { success: true, id: result.lastInsertRowId };
    } else {
      console.log("Failed to obtain lastInsertRowId for new category:", name);
      return { success: false, id: null };
    }
  } catch (error) {
    console.error("Error inserting new category:", error);
    return { success: false, id: null };
  }
}

const deleteCategoryById = async (categoryId) => {
  const db = await SQLite.openDatabaseAsync("recipes.db");
  try {
    const result = await db.runAsync("DELETE FROM categories WHERE id = ?;", [
      categoryId,
    ]);
    if (result.rowsAffected === 0) {
      return { success: false, rowsAffected: result.rowsAffected };
    }
    return { success: true, rowsAffected: result.rowsAffected };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
};

const insertRecipeWithCategories = async (recipe) => {
  const db = await SQLite.openDatabaseAsync("recipes.db");
  try {
    // Insert recipe into recipes table
    const result = await db.runAsync(
      "INSERT INTO recipes (title, ingredients, instructions, image, totalTime) VALUES (?, ?, ?, ?, ?);",
      [
        recipe.title,
        JSON.stringify(recipe.ingredients),
        recipe.instructions,
        recipe.image,
        recipe.totalTime,
      ]
    );
    const recipeId = result.lastInsertRowId;

    // Insert categories associations if any
    if (
      recipe.categoryIds &&
      Array.isArray(recipe.categoryIds) &&
      recipe.categoryIds.length > 0
    ) {
      for (const categoryId of recipe.categoryIds) {
        await db.runAsync(
          "INSERT INTO recipe_categories (recipeId, categoryId) VALUES (?, ?);",
          [recipeId, categoryId]
        );
      }
    }
    return recipeId; // Return the new recipe ID after successful insertions
  } catch (error) {
    console.error("Failed to insert recipe or associate categories:", error);
    throw error; // Rethrow to handle errors in the calling function
  }
};

async function fetchAllRecipesWithCategories() {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    const rows = await db.getAllAsync(`
      SELECT r.id, r.title, r.ingredients, r.instructions, r.image, r.totalTime, GROUP_CONCAT(c.name) AS categoryNames
      FROM recipes r
      LEFT JOIN recipe_categories rc ON r.id = rc.recipeId
      LEFT JOIN categories c ON rc.categoryId = c.id
      GROUP BY r.id;
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching recipes with categories", error);
    throw error;
  }
}

async function updateRecipeWithCategories(id, recipe, categoryIds) {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    await db.runAsync(
      `
      UPDATE recipes SET title = ?, ingredients = ?, instructions = ?, image = ?, totalTime = ? WHERE id = ?;`,
      [
        recipe.title,
        recipe.ingredients,
        recipe.instructions,
        recipe.image,
        recipe.totalTime,
        id,
      ]
    );
    await db.runAsync(`DELETE FROM recipe_categories WHERE recipeId = ?;`, [
      id,
    ]);
    for (const categoryId of categoryIds) {
      await db.runAsync(
        `INSERT INTO recipe_categories (recipeId, categoryId) VALUES (?, ?);`,
        [id, categoryId]
      );
    }
    console.log("Recipe updated successfully with new category associations");
    return true; // Indicate success
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return false; // Indicate failure
  }
}

const fetchRecipesByCategory = async (categoryId) => {
  const db = await SQLite.openDatabaseAsync("recipes.db");
  try {
    const recipes = await db.getAllAsync(
      "SELECT r.* FROM recipes r JOIN recipe_categories rc ON r.id = rc.recipeId WHERE rc.categoryId = ?;",
      [categoryId]
    );
    return recipes;
  } catch (error) {
    console.error("Error fetching recipes by category:", error);
    return null;
  }
};

const deleteRecipeFromCategory = async (recipeId, categoryId, callback) => {
  const db = await SQLite.openDatabaseAsync("recipes.db");
  try {
    await db.runAsync(
      "DELETE FROM recipe_categories WHERE recipeId = ? AND categoryId = ?;",
      [recipeId, categoryId]
    );
    console.log("Recipe deleted from category successfully");
    if (callback) {
      callback();
    }
  } catch (error) {
    console.error("Failed to delete recipe from category:", error);
  }
};

async function resetDatabase() {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    await db.execAsync(`
      DROP TABLE IF EXISTS recipes;
      DROP TABLE IF EXISTS categories;
      DROP TABLE IF EXISTS recipe_categories;
    `);
    console.log("All specified tables were dropped successfully");
  } catch (error) {
    console.error("Error dropping tables: ", error);
    throw error;
  }
}

const addRecipeToCategory = async (categoryId, recipeId) => {
  const db = await SQLite.openDatabaseAsync("recipes.db");
  try {
    // Check if the association already exists to prevent duplicates
    const existingLink = await db.getFirstAsync(
      "SELECT * FROM recipe_categories WHERE recipeId = ? AND categoryId = ?;",
      [recipeId, categoryId]
    );
    if (!existingLink) {
      await db.runAsync(
        "INSERT INTO recipe_categories (recipeId, categoryId) VALUES (?, ?);",
        [recipeId, categoryId]
      );
      console.log("Recipe added to category successfully");
      return {
        success: true,
        message: "Recipe added to category successfully",
      };
    } else {
      console.log("Recipe already linked to this category");
      return {
        success: false,
        message: "Recipe already linked to this category",
      };
    }
  } catch (error) {
    console.error("Failed to add recipe to category:", error);
    return { success: false, message: "Failed to add recipe to category" };
  }
};

export {
  initDB,
  fetchRecipeById,
  fetchAllRecipes,
  deleteRecipeById,
  fetchAllCategories,
  insertCategory,
  deleteCategoryById,
  insertRecipeWithCategories,
  fetchAllRecipesWithCategories,
  updateRecipeWithCategories,
  fetchRecipesByCategory,
  deleteRecipeFromCategory,
  addRecipeToCategory,
};
