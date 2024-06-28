import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { fetchRecipeById } from "../util/database";
import { FontAwesome5 } from "@expo/vector-icons";
import CustomButton from "../components/UI/CustomButton";

function ShoppingListScreen({ route }) {
  const { selectedRecipes } = route.params;
  const [ingredientsList, setIngredientsList] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      let allIngredients = [];

      for (let recipeId of selectedRecipes) {
        const data = await fetchRecipeById(recipeId);

        if (data) {
          let ingredientsArray;
          try {
            ingredientsArray = JSON.parse(data.ingredients);

            // Check if ingredientsArray is still a string, if so parse it again
            if (typeof ingredientsArray === "string") {
              ingredientsArray = JSON.parse(ingredientsArray);
            }

            if (Array.isArray(ingredientsArray)) {
              allIngredients = allIngredients.concat(ingredientsArray);
            } else {
              console.error(
                "Ingredients are not in array format after parsing:",
                ingredientsArray
              );
            }
          } catch (error) {
            console.error("Failed to parse ingredients:", error);
          }
        } else {
          console.error("No data returned for recipe ID:", recipeId);
        }
      }

      const combinedIngredients = combineIngredients(allIngredients);
      setIngredientsList(combinedIngredients);
    };

    fetchIngredients();
  }, [selectedRecipes]);

  const combineIngredients = (ingredients) => {
    const combined = {};
    ingredients.forEach((ingredient) => {
      if (
        !ingredient ||
        typeof ingredient !== "object" ||
        Array.isArray(ingredient)
      ) {
        console.error("Invalid ingredient format:", ingredient);
        return;
      }

      const name = ingredient.name || "Unknown ingredient";
      const unit = ingredient.unit || "Unknown unit";
      const quantity = parseFloat(ingredient.quantity) || 0;

      if (quantity === 0 || !name || !unit) {
        console.error("Invalid ingredient data:", ingredient);
        return;
      }

      const key = `${name}-${unit}`;
      if (combined[key]) {
        combined[key].quantity += quantity;
      } else {
        combined[key] = {
          name: name,
          quantity: quantity,
          unit: unit,
        };
      }
    });
    return Object.values(combined);
  };

  const toggleChecked = (key) => {
    setIngredientsList(
      ingredientsList.map((item) => {
        if (`${item.name}-${item.unit}` === key) {
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    );
  };

  const renderItem = ({ item }) => {
    const itemKey = `${item.name}-${item.unit}`;
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => toggleChecked(itemKey)}>
          <View style={styles.checkbox}>
            {item.checked && (
              <FontAwesome5 name="check" size={16} color="green" />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.itemText}>
          {`${item.quantity} ${item.unit} ${item.name}`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={ingredientsList}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.name}-${item.unit}`}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <CustomButton title="הוספה לרשימה" onPress={{}} />
    </View>
  );
}

export default ShoppingListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  itemContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 10,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
    textAlign: "left",
    marginLeft: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#acacac",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
