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
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function RecipeDetailScreen({ navigation, route }) {
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
          <Entypo name="swap" size={wp("6%")} color="white" />
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

export default RecipeDetailScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
  },
  recipeImage: {
    width: "100%",
    height: hp("40%"),
  },
  detailsContainer: {
    backgroundColor: "white",
    borderTopRightRadius: wp("8%"),
    borderTopLeftRadius: wp("8%"),
    marginTop: -hp("5%"),
    paddingTop: hp("4%"),
    paddingHorizontal: wp("5%"),
    paddingBottom: hp("2%"),
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  recipeTitle: {
    fontSize: wp("6%"),
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
    marginBottom: hp("2%"),
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp("1%"),
  },
  categoryName: {
    fontSize: wp("4%"),
  },
  dot: {
    width: wp("1.5%"),
    height: wp("1.5%"),
    borderRadius: wp("0.75%"),
    backgroundColor: "black",
    marginHorizontal: wp("2%"),
  },
  totalTime: {
    fontSize: wp("4%"),
  },
  separator: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: hp("1%"),
  },
  heading: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
    textAlign: "right",
    alignSelf: "flex-start",
  },
  instructionsContainer: {
    paddingBottom: hp("1%"),
  },
  instructions: {
    fontSize: wp("4%"),
    marginBottom: hp("1%"),
    textAlign: "left",
  },
  instructionStep: {
    fontSize: wp("4%"),
    marginBottom: hp("1%"),
  },
  instructionText: {
    fontSize: wp("4%"),
    marginBottom: hp("1%"),
    textAlign: "left",
  },
  instructionStepContainer: {
    marginBottom: hp("0.5%"),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: hp("2%"),
    paddingHorizontal: wp("5%"),
  },
  convertUnitsBtn: {
    backgroundColor: colors.secondaryGreen,
    paddingHorizontal: wp("2.5%"),
    paddingVertical: hp("1%"),
    borderRadius: wp("4%"),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: wp("45%"),
    marginBottom: hp("1%"),
    marginTop: hp("1%"),
  },
  convertUnitsBtnText: {
    color: "white",
    fontSize: wp("3.5%"),
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#cccccc",
  },
  iconsContainer: {
    flexDirection: "row",
    position: "absolute",
    right: wp("1%"),
  },
  iconButton: {
    paddingHorizontal: wp("3%"),
    height: hp("5%"),
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    backgroundColor: "white",
    borderRadius: wp("2%"),
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("2%"),
    width: wp("40%"),
    position: "absolute",
    top: hp("43%"),
    right: wp("10%"),
    zIndex: 1001,
  },
  menuItem: {
    alignItems: "center",
    padding: hp("1%"),
  },
  menuText: {
    color: "black",
    fontSize: wp("4%"),
  },
});
