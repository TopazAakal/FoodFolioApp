import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
import getImageSource from "../util/image";
import { formatUnit, singularUnits, pluralUnits } from "../util/unitConversion";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import colors from "../constants/colors";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function RecipeDeatailScreen({ navigation, route }) {
  const [recipe, setRecipe] = useState({
    title: "",
    instructions: {},
    totalTime: "",
    image: null,
    ingredients: [],
  });
  const [displayedIngredients, setDisplayedIngredients] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [isConvertModalVisible, setConvertModalVisible] = useState(false);

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
              instructions: JSON.parse(data.instructions),
              ingredients: JSON.parse(data.ingredients),
              categoryToShow,
              totalTime: data.totalTime,
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
    let ingredientsArray;

    try {
      ingredientsArray =
        typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    } catch (error) {
      console.error("Failed to parse ingredients:", error);
      ingredientsArray = [];
    }

    return ingredients.map((ingredient, index) => {
      const quantity = ingredient.quantity
        ? parseFloat(ingredient.quantity)
        : 1;
      const unit = formatUnit(quantity, ingredient.unit || "");

      return (
        <IngredientItem key={index} ingredient={{ ...ingredient, unit }} />
      );
    });
  };

  const formatInstructions = (instructions) => {
    let instructionsObject;
    try {
      instructionsObject =
        typeof instructions === "string"
          ? JSON.parse(instructions)
          : instructions;
    } catch (error) {
      console.error("Failed to parse instructions:", error);
      instructionsObject = {};
    }

    if (!instructionsObject || typeof instructionsObject !== "object") {
      console.error("Invalid instructions format:", instructionsObject);
      return null;
    }

    return (
      <View style={[styles.instructionsContainer]}>
        {Object.entries(instructionsObject).map(([step, text], index) => (
          <View key={index} style={styles.instructionStepContainer}>
            <Text style={[styles.instructionText]}>
              {step}. {text}
            </Text>
          </View>
        ))}
      </View>
    );
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

    // Clean up and format the instructions
    let formattedInstructions = "";
    if (recipe.instructions) {
      try {
        const instructionsObject =
          typeof recipe.instructions === "string"
            ? JSON.parse(recipe.instructions)
            : recipe.instructions;

        if (
          typeof instructionsObject === "object" &&
          instructionsObject !== null
        ) {
          formattedInstructions = Object.entries(instructionsObject)
            .map(([step, text]) => `<li>${text}</li>`)
            .join("");
        } else {
          formattedInstructions = `<li>${instructionsObject}</li>`;
        }
      } catch (error) {
        console.error("Failed to parse instructions:", error);
        formattedInstructions = "<li>הוראות הכנה לא זמינות</li>";
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
            ol { padding-right: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${imageBase64}" class="recipe-image" />
            <div class="title">${recipe.title}</div>
            <div class="meta-info">
              <span>${recipe.categoryToShow}</span>
              <span>&#8226;</span>
              <span>${recipe.totalTime || "לא צוין"}</span>
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
              <ol>
                ${formattedInstructions}
              </ol>
            </div>
          </div>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const toggleOptionsMenu = () => {
    setMenuVisible((prevState) => !prevState);
  };

  const closeOptionsMenu = () => {
    setMenuVisible(false);
  };

  return (
    <ScrollView style={styles.screen}>
      <Image source={getImageSource(recipe.image)} style={styles.recipeImage} />
      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <View style={styles.iconsContainer}>
            <TouchableOpacity
              onPress={toggleOptionsMenu}
              style={styles.iconButton}
            >
              <FontAwesome name="ellipsis-v" size={26} color="black" />
            </TouchableOpacity>
          </View>
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
        <View style={styles.instructionsContainer}>
          {formatInstructions(recipe.instructions)}
        </View>
      </View>
      <TimerControls />

      <ConversionModal
        isVisible={isConvertModalVisible}
        onClose={() => setConvertModalVisible(false)}
        ingredients={displayedIngredients}
        setIngredients={setDisplayedIngredients}
        pluralUnits={pluralUnits}
        singularUnits={singularUnits}
      />

      {menuVisible && (
        <TouchableWithoutFeedback onPress={closeOptionsMenu}>
          <View style={styles.menu}>
            <TouchableOpacity onPress={generatePdf} style={styles.menuItem}>
              <Text style={styles.menuText}>ייצוא ל pdf</Text>
            </TouchableOpacity>
            <EditRecipeButton
              navigation={navigation}
              recipeId={route.params?.recipeId}
              onPress={closeOptionsMenu}
            />
            <DeleteRecipeButton
              navigation={navigation}
              recipeId={route.params?.recipeId}
              onPress={closeOptionsMenu}
            />
          </View>
        </TouchableWithoutFeedback>
      )}
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginBottom: 10,
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
  instructionsContainer: {
    paddingBottom: 5,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "left",
  },
  instructionStep: {
    fontSize: 16,
    marginBottom: 5,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "left",
  },
  instructionStepContainer: {
    marginBottom: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  convertUnitsBtn: {
    backgroundColor: colors.secondaryGreen,
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
  iconsContainer: {
    flexDirection: "row",
    position: "absolute",
    right: 0,
  },
  iconButton: {
    paddingHorizontal: 10,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingVertical: 5,
    paddingHorizontal: 5,
    width: 140,
    position: "absolute",
    top: 330,
    right: 32,
    zIndex: 1001,
  },
  menuItem: {
    alignItems: "center",
    padding: 7,
  },
  menuText: {
    color: "black",
    fontSize: 16,
  },
});
