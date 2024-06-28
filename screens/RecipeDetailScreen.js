import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { fetchRecipeById } from "../util/database";
import { I18nManager } from "react-native";
import { Entypo } from "@expo/vector-icons";
import IngredientItem from "../components/IngredientItem";
import TimerControls from "../components/TimerControls";
import ConversionModal from "../components/ConversionModal";
import EditRecipeButton from "../components/EditRecipeButton";
import DeleteRecipeButton from "../components/DeleteRecipeButton";

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
  const [displayedIngredients, setDisplayedIngredients] = useState([]);
  const [isConvertModalVisible, setConvertModalVisible] = useState(false);

  const pluralUnits = {
    'מ"ל': "מיליליטרים",
    ליטר: "ליטרים",
    'מ"ג': "מיליגרם",
    גרם: "גרם",
    'ק"ג': "קילוגרם",
    כוס: "כוסות",
    כף: "כפות",
    כפית: "כפיות",
    יחידה: "יחידות",
    קורט: "קורט",
  };

  const singularUnits = {
    מיליליטרים: 'מ"ל',
    ליטרים: "ליטר",
    מיליגרם: 'מ"ג',
    גרם: "גרם",
    קילוגרם: 'ק"ג',
    כוסות: "כוס",
    כפות: "כף",
    כפיות: "כפית",
    יחידות: "יחידה",
    קורט: "קורט",
  };

  useEffect(() => {
    const { recipeId, selectedCategory } = route.params;
    const fetchRecipe = async () => {
      if (recipeId) {
        try {
          const data = await fetchRecipeById(recipeId);
          if (data) {
            const ingredientsArray = JSON.parse(data.ingredients || []);
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
            setDisplayedIngredients(ingredientsArray);
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

  useEffect(() => {
    if (recipe.ingredients.length > 0) {
      let parsedIngredients;
      try {
        parsedIngredients =
          typeof recipe.ingredients === "string"
            ? JSON.parse(recipe.ingredients)
            : recipe.ingredients;
      } catch (error) {
        console.error("Failed to parse ingredients in useEffect:", error);
        parsedIngredients = [];
      }
      setDisplayedIngredients(parsedIngredients);
    }
  }, [recipe.ingredients]);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const formatIngredients = (ingredients) => {
    return ingredients.map((ingredient, index) => {
      const quantity = parseFloat(ingredient.quantity);
      let unit = ingredient.unit;

      // Pluralization and singularization logic
      if (quantity > 1 && pluralUnits[unit]) {
        unit = pluralUnits[unit];
      } else if (quantity <= 1) {
        unit = singularUnits[unit] || unit;
      }

      return (
        <IngredientItem key={index} ingredient={{ ...ingredient, unit }} />
      );
    });
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
        <View>
          {Array.isArray(displayedIngredients) &&
          displayedIngredients.length > 0 ? (
            formatIngredients(displayedIngredients)
          ) : (
            <Text>אין מרכיבים</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.convertUnitsBtn}
          onPress={() => setConvertModalVisible(true)}
        >
          <Entypo name="swap" size={24} color="white" />
          <Text style={styles.convertUnitsBtnText}>המרת יחידות מידה </Text>
        </TouchableOpacity>
        <Text style={styles.heading}>הוראות הכנה</Text>
        <Text style={styles.instructions}>{recipe.instructions}</Text>
      </View>
      <TimerControls />

      <View style={styles.buttonContainer}>
        <EditRecipeButton
          navigation={navigation}
          recipeId={route.params?.recipeId}
        />
        <DeleteRecipeButton
          navigation={navigation}
          recipeId={route.params?.recipeId}
        />
      </View>

      <ConversionModal
        isVisible={isConvertModalVisible}
        onClose={() => setConvertModalVisible(false)}
        ingredients={displayedIngredients}
        setIngredients={setDisplayedIngredients}
        pluralUnits={pluralUnits}
        singularUnits={singularUnits}
      />
    </ScrollView>
  );
}

export default RecipeDeatailScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
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
    paddingBottom: 20,
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
  convertUnitsBtn: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "45%",
    marginBottom: 10,
    marginTop: 10,
  },
  convertUnitsBtnText: {
    color: "white",
    fontSize: 14,
    paddingLeft: 8,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#cccccc",
  },
});
