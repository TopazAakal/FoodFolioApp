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
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

import { FontAwesome5 } from "@expo/vector-icons";

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

  const generatePdf = async () => {
    let imageUri = recipe.image;
    let imageBase64 = "";

    if (imageUri) {
      try {
        imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: "base64",
        });
        imageBase64 = `data:image/png;base64,${imageBase64}`;
      } catch (error) {
        console.error("Failed to convert image to base64:", error);
      }
    }

    const html = `
      <html dir="rtl" lang="he">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
            .container { padding: 20px 50px; }
            .title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; }
            .meta-info { display: flex; justify-content: center; align-items: center; margin-bottom: 20px; }
            .meta-info span { margin: 0 10px; }
            .ingredients, .instructions { margin-bottom: 20px; }
            .heading { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .ingredient-item { margin-bottom: 5px; }
            .recipe-image { width: 100%; height: auto; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${imageBase64}" class="recipe-image" />
            <div class="title">${recipe.title}</div>
            <div class="meta-info">
              <span>${recipe.categoryToShow}</span>
              <span>&#8226;</span>
              <span>${recipe.totalTime}</span>
            </div>
            <div class="ingredients">
              <div class="heading">מרכיבים</div>
              ${displayedIngredients
                .map(
                  (ingredient) => `
                <div class="ingredient-item">
                  ${ingredient.quantity} ${ingredient.unit} ${ingredient.name}
                </div>
              `
                )
                .join("")}
            </div>
            <div class="instructions">
              <div class="heading">הוראות הכנה</div>
              <div>${recipe.instructions}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <ScrollView style={styles.screen}>
      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <TouchableOpacity onPress={generatePdf} style={styles.shareButton}>
            <FontAwesome5 name="file-export" size={24} color="black" />
          </TouchableOpacity>
        </View>
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    flex: 1,
  },
  shareButton: {
    padding: 10,
    position: "absolute",
    right: 0,
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
