import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { fetchRecipeById, deleteRecipeById } from "../util/database";
import { Ionicons } from "@expo/vector-icons";
import { I18nManager } from "react-native";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function RecipeDeatailScreen({ navigation, route }) {
  const [recipe, setRecipe] = useState({
    title: "",
    instructions: "",
    totalTime: "",
    image: null,
    ingredients: [],
  });

  useEffect(() => {
    const { recipeId, selectedCategory } = route.params;
    const fetchRecipe = async () => {
      if (recipeId) {
        try {
          const data = await fetchRecipeById(recipeId); // Assuming fetchRecipeById is now an async function returning the recipe data or throwing an error.
          if (data) {
            const ingredientsArray = JSON.parse(data.ingredients || "[]");
            const categoryNames = data.categoryNames
              ? data.categoryNames.split(",")
              : [];
            const categoryToShow =
              selectedCategory || categoryNames[0] || "ללא קטגוריה";
            setRecipe({
              ...data,
              ingredients: ingredientsArray,
              categoryToShow,
            });
          } else {
            console.error("No data returned for recipe ID:", recipeId);
          }
        } catch (error) {
          console.error("Failed to fetch recipe for ID:", recipeId, error);
        }
      }
    };

    fetchRecipe();
  }, [route.params]);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("מחיקת מתכון", "האם אתה בטוח שברצונך למחוק את המתכון?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחיקה",
        onPress: async () => {
          const recipeId = route.params?.recipeId;
          try {
            if (recipeId) {
              await deleteRecipeById(recipeId);
              Alert.alert("המתכון נמחק בהצלחה", "", [
                { text: "אישור", onPress: () => navigation.goBack() },
              ]);
            } else {
              Alert.alert("שגיאה", "המתכון לא נמחק בהצלחה");
            }
          } catch (error) {
            Alert.alert("שגיאה", "המתכון לא נמחק בהצלחה");
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    //TODO
    // navigation.navigate("AddRecipe", { recipeId: recipe.id });
  };

  function IngredientItem({ ingredient }) {
    const [isChecked, setIsChecked] = useState(false);

    const toggleCheck = () => setIsChecked(!isChecked);

    return (
      <TouchableOpacity onPress={toggleCheck} style={styles.ingredientItem}>
        {isChecked ? (
          <View style={styles.checkboxChecked}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        ) : (
          <View style={styles.checkbox} />
        )}
        <Text
          style={styles.ingredientText}
        >{`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}</Text>
      </TouchableOpacity>
    );
  }

  const formatIngredients = (ingredients) => {
    let ingredientsArray;
    try {
      ingredientsArray =
        typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    } catch (e) {
      console.error("Error parsing ingredients:", e);
      ingredientsArray = [];
    }
    if (!Array.isArray(ingredientsArray)) {
      console.error(
        "Expected ingredientsArray to be an array but got:",
        typeof ingredientsArray
      );
      return null;
    }
    return ingredientsArray.map((ingredient, index) => (
      <IngredientItem key={index} ingredient={ingredient} />
    ));
  };

  return (
    <ScrollView style={styles.screen}>
      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      <View style={styles.detailsContainer}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        <View style={styles.metaInfo}>
          <Text style={styles.categoryName}>{recipe.categoryToShow}</Text>

          <View style={styles.dot}></View>
          <Text style={styles.totalTime}>{recipe.totalTime}</Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.heading}>מרכיבים</Text>
        <View>{formatIngredients(recipe.ingredients)}</View>
        <Text style={styles.heading}>הוראות הכנה</Text>
        <Text style={styles.instructions}>{recipe.instructions}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>עריכת מתכון</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>מחיקת מתכון</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default RecipeDeatailScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  recipeImage: {
    width: "100%",
    height: 300,
  },
  detailsContainer: {
    backgroundColor: "white",
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    marginTop: -20,
    paddingTop: 30,
    paddingHorizontal: 20,
    height: "65%",
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "black",
    marginHorizontal: 10,
  },
  totalTime: {
    fontSize: 16,
  },
  separator: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "right",
    alignSelf: "flex-start",
  },
  ingredientText: {
    fontSize: 16,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "left",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#cccccc",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
    marginVertical: 10,
    padding: 15,
  },
  editButton: {
    backgroundColor: "#8a8a8a",
  },
  deleteButton: {
    backgroundColor: "#8a8a8a",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  ingredientText: {
    fontSize: 16,
  },
});
