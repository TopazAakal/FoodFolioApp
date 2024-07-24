import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { I18nManager } from "react-native";
import LabeledInput from "../components/UI/LabeledInput";
import CustomButton from "../components/UI/CustomButton";
import Ionicons from "react-native-vector-icons/Ionicons";
import ImagePicker from "../components/UI/ImagePicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomCheckbox from "../components/UI/CustomCheckbox";
import { Picker } from "@react-native-picker/picker";
import {
  fetchAllCategories,
  insertCategory,
  updateRecipeWithCategories,
  insertRecipeWithCategories,
  fetchRecipeById,
} from "../util/database";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const defaultImage = "../images/recipe_placeholder.jpg";

function AddRecipeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const recipeId = route.params?.recipeId || null;
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [category, setCategory] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [recipeImage, setRecipeImage] = useState(null);
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [detectedText, setDetectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const unitOptions = [
    { label: 'מ"ל', value: 'מ"ל' },
    { label: "ליטר", value: "ליטר" },
    { label: 'מ"ג', value: 'מ"ג' },
    { label: "גרם", value: "גרם" },
    { label: 'ק"ג', value: "קילוגרם" },
    { label: "כוס", value: "כוס" },
    { label: "כף", value: "כף" },
    { label: "כפית", value: "כפית" },
    { label: "יחידה", value: "יחידה" },
    { label: "קורט", value: "קורט" },
  ];

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

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchAllCategories();
      if (data) {
        setCategories(data);
      } else {
        console.log("Failed to fetch categories");
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (recipeId) {
      fetchRecipeDetails(recipeId);
    }
  }, [categories, recipeId]);

  const getCategoryIdsFromNames = (namesString, categories) => {
    if (!namesString) return [];
    const namesArray = namesString.split(",");

    const catIds = categories
      .filter((cat) => namesArray.includes(cat.name.trim()))
      .map((cat) => cat.id.toString());

    return catIds;
  };

  const fetchRecipeDetails = async (recipeId) => {
    const data = await fetchRecipeById(recipeId);
    if (data) {
      try {
        const ingredients = JSON.parse(data.ingredients || []);
        const categoryIds = getCategoryIdsFromNames(
          data.categoryNames,
          categories
        );
        setTitle(data.title);
        setInstructions(data.instructions);
        setTotalTime(data.totalTime);
        setRecipeImage(data.image);
        setIngredients(ingredients);
        setSelectedCategories(categoryIds);
      } catch (e) {
        console.error("Error parsing recipe details:", e);
      }
    } else {
      console.error("Failed to fetch recipe details for recipe ID:", recipeId);
    }
  };

  const handleSaveRecipe = async () => {
    // Ensure instructions are in the correct format
    let parsedInstructions;
    try {
      parsedInstructions = JSON.parse(instructions);
    } catch (error) {
      const instructionLines = instructions
        .split("\n")
        .filter((line) => line.trim() !== "");
      parsedInstructions = instructionLines.reduce((acc, line, index) => {
        acc[index + 1] = line;
        return acc;
      }, {});
    }

    setInstructions(JSON.stringify(parsedInstructions));

    // Ensure ingredients are in the correct format
    // let parsedIngredients;
    // try {
    //   parsedIngredients = Array.isArray(ingredients)
    //     ? ingredients
    //     : JSON.parse(ingredients);
    // } catch (error) {
    //   console.error("Failed to parse ingredients:", error);
    //   return;
    // }
    try {
      if (!ingredients) {
        alert("Please insert an ingredients first.");
        return;
      }
      setLoading(true);
      const response = await axios.post(
        "https://ilwcjy1wk4.execute-api.us-east-1.amazonaws.com/dev/",
        {
          ingredients: String(
            "title: " + title + "; ingredients: " + ingredients
          ),
        }
      );
      try {
        const data = JSON.parse(response.data.body);

        const resultString = data.result
          .replace(/\\n/g, "")
          .replace(/\\"/g, '"');
        // .replace(/(\d+):/g, '"$1":');
        const detectedJson = JSON.parse(resultString);
        console.log(detectedJson);

        if (detectedJson.Ingredients) {
          detectedJson.ingredients = detectedJson.Ingredients;
          delete detectedJson.Ingredients;
        }
        console.log(detectedJson);

        setDetectedText(detectedJson);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    if (detectedText) {
      const getCategoryIds = async () => {
        let categoryIds = [...selectedCategories];
        if (category.trim() !== "") {
          const existingCategory = categories.find(
            (cat) => cat.name === category
          );
          if (!existingCategory) {
            try {
              const newCategoryId = await insertNewCategory(category);
              console.log(`New category inserted with ID: ${newCategoryId}`);
              categoryIds = [...categoryIds, newCategoryId.toString()];
            } catch (error) {
              console.error("Failed to insert new category", error);
              return categoryIds; // Return existing categories on error
            }
          } else {
            categoryIds = [...categoryIds, existingCategory.id.toString()];
          }
        }
        return categoryIds;
      };

      const saveRecipe = async (categoryIds) => {
        const imageUri = recipeImage || defaultImage;
        const recipeData = {
          title,
          ingredients: detectedText.ingredients,
          instructions: instructions,
          totalTime,
          image: imageUri,
          categoryIds: categoryIds.map((id) => id.toString()),
        };

        if (recipeId) {
          const success = await updateRecipeWithCategories(
            recipeId,
            recipeData,
            categoryIds
          );
          if (success) {
            console.log(`Recipe updated successfully with ID: ${recipeId}`);
            navigation.replace("RecipeDisplay", { recipeId: recipeId });
          } else {
            console.error("Failed to update recipe");
          }
        } else {
          // Adding new recipe
          console.log("Adding new recipe with data:", recipeData);
          const newRecipeId = await insertRecipeWithCategories(recipeData);
          console.log(`Recipe added successfully with ID: ${newRecipeId}`);
          navigation.replace("AllCategories");
        }
      };

      // Execute the async function to get category IDs and save the recipe
      (async () => {
        const categoryIds = await getCategoryIds();
        await saveRecipe(categoryIds);
      })();
    }
  }, [detectedText, recipeImage, title, totalTime, instructions, recipeId]);

  const insertNewCategory = async (categoryName) => {
    const result = await insertCategory(categoryName, "");
    if (result.success) {
      console.log("New category inserted with ID:", result.id);
      return result.id;
    } else {
      throw new Error("Failed to insert new category");
    }
  };

  const toggleCategorySelection = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  function takeImageHandler(imageUri) {
    setRecipeImage(imageUri);
  }

  const addIngredientHandler = () => {
    if (ingredientName && quantity && selectedUnit) {
      let updatedQuantity = parseFloat(quantity);
      let updatedUnit = selectedUnit;

      // Unit conversion logic
      if (selectedUnit === "גרם" && updatedQuantity >= 1000) {
        updatedQuantity /= 1000;
        updatedUnit = 'ק"ג';
      } else if (selectedUnit === 'מ"ל' && updatedQuantity >= 1000) {
        updatedQuantity /= 1000;
        updatedUnit = "ליטר";
      }

      // Pluralization logic
      if (updatedQuantity > 1 && pluralUnits[updatedUnit]) {
        updatedUnit = pluralUnits[updatedUnit];
      }

      const newIngredient = {
        name: ingredientName,
        quantity:
          updatedQuantity % 1 === 0
            ? updatedQuantity.toString()
            : updatedQuantity.toFixed(2),
        unit: updatedUnit,
      };

      setIngredients((currentIngredients) => [
        ...(Array.isArray(currentIngredients) ? currentIngredients : []),
        newIngredient,
      ]);
      setIngredientName("");
      setQuantity("");
      setSelectedUnit(unitOptions[0].value);
    }
  };

  const editIngredientHandler = (index) => {
    const ingredientToEdit = ingredients[index];
    setIngredientName(ingredientToEdit.name);
    setQuantity(ingredientToEdit.quantity);
    setSelectedUnit(ingredientToEdit.unit);
    removeIngredient(index);
  };

  const removeIngredient = (index) => {
    setIngredients((currentIngredients) =>
      Array.isArray(currentIngredients)
        ? currentIngredients.filter((_, i) => i !== index)
        : []
    );
  };

  const handleToggleCategories = () => {
    setShowCategories((prevShowCategories) => !prevShowCategories);
  };

  const formatIngredients = (ingredientsInput) => {
    const ingredientsArray =
      typeof ingredientsInput === "string"
        ? JSON.parse(ingredientsInput)
        : ingredientsInput;

    return ingredientsArray.map((ingredient, index) => {
      const quantity = parseFloat(ingredient.quantity);
      let unit = ingredient.unit;

      // Pluralization logic
      if (quantity > 1 && pluralUnits[unit]) {
        unit = pluralUnits[unit];
      }
      return (
        <View key={index} style={styles.ingredientListItem}>
          <Text style={styles.ingredientText}>
            {`${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => editIngredientHandler(index)}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => removeIngredient(index)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  };

  return (
    <KeyboardAwareScrollView style={styles.rootContainer}>
      <View style={styles.form}>
        <LabeledInput
          value={title}
          onChangeText={setTitle}
          placeholder="שם המתכון"
        />

        <LabeledInput
          value={totalTime}
          placeholder="זמן הכנה כולל"
          onChangeText={setTotalTime}
        />

        <ImagePicker
          onTakeImage={takeImageHandler}
          initialImage={recipeImage}
        />
        <View>{formatIngredients(ingredients)}</View>

        <View style={styles.ingredientSection}>
          <View style={styles.ingredientInputContainer}>
            <TextInput
              style={styles.ingredientInput}
              placeholder="מרכיב"
              placeholderTextColor="#666"
              value={ingredientName}
              onChangeText={setIngredientName}
            />
            <TextInput
              style={styles.quantityInput}
              placeholder="0"
              placeholderTextColor="#666"
              value={quantity}
              onChangeText={(text) => setQuantity(text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
            />
            <View style={styles.unitPicker}>
              <Picker
                selectedValue={selectedUnit}
                onValueChange={(itemValue) => setSelectedUnit(itemValue)}
                style={styles.unitPicker}
                itemStyle={styles.unitPicker.itemStyle}
              >
                {unitOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={addIngredientHandler}
          >
            <Ionicons name="add" size={30} style={styles.addButtonIcon} />
            <Text style={styles.addButtonText}>הוסף עוד</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Text style={styles.title}>הוראות הכנה</Text>
        </View>
        <LabeledInput
          value={instructions}
          onChangeText={setInstructions}
          placeholder="טקסט חופשי"
          multiline
        />

        <View>
          <TouchableOpacity
            onPress={handleToggleCategories}
            style={styles.categoryButton}
          >
            <Text style={styles.categoryButtonText}>קטגוריה קיימת</Text>
          </TouchableOpacity>

          {showCategories &&
            categories.map((cat) => (
              <CustomCheckbox
                key={cat.id}
                label={cat.name}
                isChecked={selectedCategories.includes(cat.id.toString())}
                onCheckChange={() => toggleCategorySelection(cat.id.toString())}
              />
            ))}
        </View>
        <LabeledInput
          value={category}
          onChangeText={setCategory}
          placeholder="קטגוריה חדשה"
        />

        <CustomButton title="שמור מתכון" onPress={handleSaveRecipe} />
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4db384" />
          <Text style={styles.loadingText}>מביא את המתכון...</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}

export default AddRecipeScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  form: {
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    textAlign: "right",
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  ingredientSection: {
    marginBottom: 20,
  },
  ingredientInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ingredientInput: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
    flex: 2,
    textAlign: "center",
    marginRight: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    paddingVertical: 10,
    fontSize: 16,
    width: 50,
    textAlign: "center",
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    width: "100%",
  },
  unitPicker: {
    paddingVertical: 6,
    flex: 1,
    itemStyle: { height: 120, fontSize: 16 },
  },

  addButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: "#4db384",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    flexDirection: "row-reverse",
    alignSelf: "center",
    width: "auto",
    minWidth: 160,
  },

  addButtonText: {
    color: "#4db384",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },

  addButtonIcon: {
    color: "#4db384",
    fontSize: 22,
    paddingRight: 5,
    fontWeight: "bold",
  },
  ingredientListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7f7f7",
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  ingredientText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
    paddingRight: 10,
  },
  editButton: {
    padding: 5,
    marginRight: 5,
  },
  deleteButton: {
    padding: 5,
  },
  categoryButton: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#ccc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: 50,
    justifyContent: "center",
    alignItems: "right",
  },
  categoryButtonText: {
    fontSize: 16,
    color: "#838181a8",
    textAlign: "right",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
});
