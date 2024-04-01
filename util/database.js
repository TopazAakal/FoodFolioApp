import * as SQLite from "expo-sqlite";
const DEFAULT_CATEGORY_IMAGE = "../images/category_placeholder.jpg";

const db = SQLite.openDatabase("recipes.db");

const initDB = () => {
  db.transaction(
    (tx) => {
      // Create recipes table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS recipes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          ingredients TEXT NOT NULL,
          instructions TEXT NOT NULL,
          image TEXT,
          totalTime TEXT
        );`
      );

      // Create categories table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL UNIQUE
        );`,
        [],
        () => {
          console.log("Created categories table");
        }
      );
      // Add image column to categories table
      tx.executeSql(
        `ALTER TABLE categories ADD COLUMN image TEXT;`,
        [],
        () => {
          console.log("Added image column to categories table");
        },

        (transaction, error) => {
          if (error.code === 1) {
            console.log(
              "The image column already exists in the categories table."
            );
          }
        }
      );
      // Insert default category
      tx.executeSql(
        "INSERT OR IGNORE INTO categories (name, image) VALUES (?, ?);",
        ["מועדפים"],
        () => {
          console.log("Inserted default category");
        }
      );

      // Create join table for many-to-many relationship
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS recipe_categories (
          recipeId INTEGER,
          categoryId INTEGER,
          PRIMARY KEY (recipeId, categoryId),
          FOREIGN KEY (recipeId) REFERENCES recipes(id) ON DELETE CASCADE,
          FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
        );`
      );
    },
    (error) => console.log("Transaction error initializing database:", error),
    () => console.log("Database initialization successful")
  );
};

// const insertRecipe = (recipe, categoryIds, callback) => {
//   db.transaction((tx) => {
//     tx.executeSql(
//       `INSERT INTO recipes (title, ingredients, instructions, image, totalTime) VALUES (?, ?, ?, ?, ?);`,
//       [
//         recipe.title,
//         JSON.stringify(recipe.ingredients),
//         recipe.instructions,
//         recipe.image,
//         recipe.totalTime,
//       ],
//       (tx, results) => {
//         const recipeId = results.insertId;
//         categoryIds.forEach((categoryId) => {
//           tx.executeSql(
//             `INSERT INTO recipe_categories (recipeId, categoryId) VALUES (?, ?);`,
//             [recipeId, categoryId]
//           );
//         });
//         callback(true, recipeId);
//       },
//       (_, error) => {
//         console.log("Failed to insert recipe:", error);
//         callback(false, error);
//       }
//     );
//   });
// };

const fetchAllRecipes = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM recipes;",
      [],
      (_, { rows }) => callback(true, rows._array),
      (_, error) => callback(false, error)
    );
  });
};

const fetchRecipeById = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT r.*, GROUP_CONCAT(c.name) AS categoryNames 
        FROM recipes r
        LEFT JOIN recipe_categories rc ON r.id = rc.recipeId
        LEFT JOIN categories c ON rc.categoryId = c.id
        WHERE r.id = ?
        GROUP BY r.id;`,
      [id],
      (_, { rows }) => {
        if (rows.length > 0) {
          callback(true, rows._array[0]);
        } else {
          console.log("No recipe found with ID:", id);
          callback(false, null);
        }
      },
      (_, error) => {
        console.log("Error fetching recipe with ID:", id, error);
        callback(false, error);
      }
    );
  });
};

// const updateRecipe = (id, recipe, callback) => {
//   db.transaction((tx) => {
//     tx.executeSql(
//       "UPDATE recipes SET title = ?, ingredients = ?, instructions = ?, image = ?, category = ?, totalTime = ? WHERE id = ?",
//       [
//         recipe.title,
//         JSON.stringify(recipe.ingredients),
//         recipe.instructions,
//         recipe.image,
//         recipe.category,
//         recipe.totalTime,
//         id,
//       ],
//       (_, result) => callback(true),
//       (_, error) => callback(false, error)
//     );
//   });
// };

const deleteRecipeById = (id, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM recipes WHERE id = ?;",
      [id],
      (_, result) => {
        console.log("Recipe deleted successfully");
        callback(true);
      },
      (_, error) => {
        console.error("Failed to delete recipe:", error);
        callback(false);
      }
    );
  });
};

const fetchAllCategories = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT id, name, image FROM categories;",
      [],
      (_, { rows }) => {
        callback(true, rows._array);
      },
      (transaction, error) => {
        console.error("Failed to fetch categories", error);
        callback(false, error);
        return true;
      }
    );
  });
};

const insertCategory = (name, image = DEFAULT_CATEGORY_IMAGE, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM categories WHERE name = ?;",
      [name],
      (tx, results) => {
        if (results.rows.length > 0) {
          console.log("Category already exists:", name);
          callback(false, { message: "Category already exists." });
        } else {
          tx.executeSql(
            "INSERT INTO categories (name, image) VALUES (?, ?);",
            [name, image],
            (tx, resultSet) => {
              console.log("New category inserted:", name);
              callback(true, resultSet.insertId);
            },
            (tx, error) => {
              console.error("Error inserting new category:", error);
              callback(false, error);
            }
          );
        }
      },
      (tx, error) => {
        console.error("Error checking if category exists:", error);
        callback(false, error);
      }
    );
  });
};

const deleteCategoryById = (categoryId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM categories WHERE id = ? AND name != 'מועדפים';`,
      [categoryId],
      (_, result) => callback(true, result),
      (_, error) => callback(false, error)
    );
  });
};

const insertRecipeWithCategories = (recipe, callback) => {
  const ingredientsString = JSON.stringify(recipe.ingredients);
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO recipes (title, ingredients, instructions, image, totalTime) VALUES (?, ?, ?, ?, ?);`,
      [
        recipe.title,
        ingredientsString,
        recipe.instructions,
        recipe.image,
        recipe.totalTime,
      ],
      (tx, results) => {
        const recipeId = results.insertId;

        if (recipe.categoryIds && recipe.categoryIds.length > 0) {
          recipe.categoryIds.forEach((categoryId) => {
            tx.executeSql(
              `INSERT INTO recipe_categories (recipeId, categoryId) VALUES (?, ?);`,
              [recipeId, categoryId]
            );
          });
        }
        callback(true, recipeId);
      },
      (tx, error) => {
        console.log("Failed to insert recipe or associate categories:", error);
        callback(false, error);
      }
    );
  });
};

const fetchAllRecipesWithCategories = (callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT r.id, r.title, r.ingredients, r.instructions, r.image, r.totalTime, GROUP_CONCAT(c.name) AS categoryNames
         FROM recipes r
         LEFT JOIN recipe_categories rc ON r.id = rc.recipeId
         LEFT JOIN categories c ON rc.categoryId = c.id
         GROUP BY r.id;`,
      [],
      (_, { rows }) => callback(true, rows._array),
      (_, error) => {
        console.log("Error fetching recipes with categories", error);
        callback(false, error);
      }
    );
  });
};

const updateRecipeWithCategories = (id, recipe, categoryIds, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE recipes SET title = ?, ingredients = ?, instructions = ?, image = ?, totalTime = ? WHERE id = ?;`,
      [
        recipe.title,
        JSON.stringify(recipe.ingredients),
        recipe.instructions,
        recipe.image,
        recipe.totalTime,
        id,
      ],
      () => {
        tx.executeSql(
          `DELETE FROM recipe_categories WHERE recipeId = ?;`,
          [id],
          () => {
            const insertPromises = categoryIds.map((categoryId) => {
              return new Promise((resolve, reject) => {
                tx.executeSql(
                  `INSERT INTO recipe_categories (recipeId, categoryId) VALUES (?, ?);`,
                  [id, categoryId],
                  () => resolve(),
                  (_, error) => reject(error)
                );
              });
            });

            Promise.all(insertPromises)
              .then(() => callback(true))
              .catch((error) => {
                console.error(
                  "Failed to update recipe categories associations:",
                  error
                );
                callback(false);
              });
          }
        );
      },
      (_, error) => {
        console.error("Failed to update recipe:", error);
        callback(false);
      }
    );
  });
};

const fetchRecipesByCategory = (categoryId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT r.id, r.title, r.ingredients, r.instructions, r.image, r.totalTime 
         FROM recipes r
         INNER JOIN recipe_categories rc ON r.id = rc.recipeId
         WHERE rc.categoryId = ?;`,
      [categoryId],
      (_, { rows }) => {
        callback(true, rows._array);
      },
      (_, error) => {
        console.log(
          "Error fetching recipes for category ID:",
          categoryId,
          error
        );
        callback(false, error);
      }
    );
  });
};

const deleteRecipeFromCategory = (recipeId, categoryId, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      "DELETE FROM recipe_categories WHERE recipeId = ? AND categoryId = ?;",
      [recipeId, categoryId],
      (_, result) => {
        console.log("Recipe-category association deleted successfully");
        callback();
      },
      (_, error) =>
        console.log("Failed to delete recipe-category association", error)
    );
  });
};

function resetDatabase() {
  db.transaction(
    (tx) => {
      const tables = ["recipes", "categories", "recipe_categories"];
      tables.forEach((table) => {
        tx.executeSql(
          `DROP TABLE IF EXISTS ${table};`,
          [],
          (_, result) => {
            console.log(`Dropped table ${table}`);
          },
          (txObj, error) => {
            console.log(`Error dropping table ${table}: `, error);
          }
        );
      });
    },
    (error) => {
      console.error("Error dropping tables: ", error);
    },
    () => {
      console.log("All specified tables were dropped successfully");
    }
  );
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
