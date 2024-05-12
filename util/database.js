import * as SQLite from "expo-sqlite";
const DEFAULT_CATEGORY_IMAGE = "../images/category_placeholder.jpg";

async function initDB() {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        image TEXT,
        totalTime TEXT
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL UNIQUE,
        image TEXT DEFAULT '${DEFAULT_CATEGORY_IMAGE}'
      );

      CREATE TABLE IF NOT EXISTS recipe_categories (
        recipeId INTEGER,
        categoryId INTEGER,
        PRIMARY KEY (recipeId, categoryId),
        FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
      );
      INSERT OR IGNORE INTO categories (name, image) VALUES ('מועדפים', '${DEFAULT_CATEGORY_IMAGE}');
    `);
    console.log("Database initialization successful");
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
      console.log("Category already exists:", name);
      return existingCategory.id;
    }

    // If the category does not exist, proceed to insert
    const result = await db.runAsync(
      "INSERT INTO categories (name, image) VALUES (?, ?);",
      [name, image]
    );
    console.log("New category inserted:", name);
    return result.lastInsertRowId;
  } catch (error) {
    console.error("Error inserting new category:", error);
    throw error;
  }
}

const deleteCategoryById = async (categoryId) => {
  const db = await SQLite.openDatabaseAsync("recipes.db");
  try {
    // First, check for any linked recipes to ensure the category can be safely deleted
    const links = await db.getAllAsync(
      "SELECT * FROM recipe_categories WHERE categoryId = ?;",
      [categoryId]
    );
    if (links.length > 0) {
      console.log(
        `Category ID ${categoryId} is linked to recipes and cannot be deleted.`
      );
      return {
        success: false,
        message: "Category is linked to recipes and cannot be deleted.",
      };
    }

    // Proceed to delete if no links
    const deleteResult = await db.runAsync(
      "DELETE FROM categories WHERE id = ? AND name != 'מועדפים';",
      [categoryId]
    );

    if (deleteResult.rowsAffected === 0) {
      console.log(`No category deleted, might not exist or is protected.`);
      return {
        success: false,
        message: "No category deleted, might not exist or is protected.",
      };
    }

    console.log(
      `Category with ID ${categoryId} deleted, rows affected: ${deleteResult.rowsAffected}`
    );
    return { success: true, rowsAffected: deleteResult.rowsAffected };
  } catch (error) {
    console.error(
      `Failed to delete category ID ${categoryId}: ${error.message}`
    );
    throw new Error(`Failed to delete category: ${error.message}`);
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
        JSON.stringify(recipe.ingredients),
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
  } catch (error) {
    console.error("Failed to update recipe:", error);
    throw error;
  }
}

async function fetchRecipesByCategory(categoryId) {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    const rows = await db.getAllAsync(
      `
      SELECT r.id, r.title, r.ingredients, r.instructions, r.image, r.totalTime 
      FROM recipes r
      INNER JOIN recipe_categories rc ON r.id = rc.recipeId
      WHERE rc.categoryId = ?;`,
      [categoryId]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching recipes for category ID:", categoryId, error);
    throw error;
  }
}

async function deleteRecipeFromCategory(recipeId, categoryId) {
  try {
    const db = await SQLite.openDatabaseAsync("recipes.db");
    await db.runAsync(
      "DELETE FROM recipe_categories WHERE recipeId = ? AND categoryId = ?;",
      [recipeId, categoryId]
    );
    console.log("Recipe-category association deleted successfully");
  } catch (error) {
    console.error("Failed to delete recipe-category association", error);
    throw error;
  }
}

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
};
