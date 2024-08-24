import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import LabeledInput from "../components/UI/LabeledInput";
import Ionicons from "react-native-vector-icons/Ionicons";
import ImagePicker from "../components/UI/ImagePicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomCheckbox from "../components/UI/CustomCheckbox";
import { Picker } from "@react-native-picker/picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { formatUnit } from "../util/unitConversion";
import PrimaryButton from "../components/UI/PrimaryButton";
import SecondaryButton from "../components/UI/SecondaryButton";
import colors from "../constants/colors";
import { unitOptions, departments } from "../constants/recipeConstants";
import {
  fetchAllCategories,
  insertCategory,
  updateRecipeWithCategories,
  insertRecipeWithCategories,
  fetchRecipeById,
} from "../util/database";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const defaultImage = "../images/recipe_placeholder.jpg";

function AddRecipeManuallyScreen() {
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
  const [selectedDepartment, setSelectedDepartment] = useState(
    departments[0].name
  );

  // Category Functions
  const loadCategories = async () => {
    const data = await fetchAllCategories();
    if (data) {
      setCategories(data);
    } else {
      console.log("Failed to fetch categories");
    }
  };

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

  const getCategoryIdsFromNames = (namesString, categories) => {
    if (!namesString) return [];
    const namesArray = namesString.split(",");

    const catIds = categories
      .filter((cat) => namesArray.includes(cat.name.trim()))
      .map((cat) => cat.id.toString());

    return catIds;
  };

  const handleToggleCategories = () => {
    setShowCategories((prevShowCategories) => !prevShowCategories);
  };

  const handleCategorySelection = async () => {
    let categoryIds = [...selectedCategories];

    if (category.trim() !== "") {
      const existingCategory = categories.find((cat) => cat.name === category);

      if (!existingCategory) {
        try {
          const newCategoryId = await insertNewCategory(category);
          console.log(`New category inserted with ID: ${newCategoryId}`);
          categoryIds.push(newCategoryId.toString());
        } catch (error) {
          console.error("Failed to insert new category", error);
          return;
        }
      } else {
        categoryIds.push(existingCategory.id.toString());
      }
    }
    return categoryIds;
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Recipe Functions

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

  useEffect(() => {
    if (recipeId) {
      fetchRecipeDetails(recipeId);
    }
  }, [categories, recipeId]);

  const isRecipeEmpty = () => {
    return (
      !title.trim() &&
      ingredients.length === 0 &&
      !instructions.trim() &&
      !totalTime.trim() &&
      !recipeImage &&
      !category.trim() &&
      selectedCategories.length === 0
    );
  };

  const showEmptyRecipeAlert = () => {
    Alert.alert("", "לא ניתן לשמור מתכון ריק. נא למלא את השדות ולנסות שוב.", [
      { text: "אישור" },
    ]);
  };

  const formatRecipeData = (
    title,
    ingredients,
    instructions,
    totalTime,
    imageUri,
    categoryIds
  ) => {
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

    // Ensure ingredients are in the correct format
    let parsedIngredients;
    try {
      parsedIngredients = Array.isArray(ingredients)
        ? ingredients
        : JSON.parse(ingredients);
    } catch (error) {
      console.error("Failed to parse ingredients:", error);
      return;
    }

    return {
      title,
      ingredients: JSON.stringify(parsedIngredients),
      instructions: JSON.stringify(parsedInstructions),
      totalTime,
      image: imageUri,
      categoryIds: categoryIds.map((id) => id.toString()),
    };
  };

  const updateExistingRecipe = async (recipeId, recipeData, categoryIds) => {
    const success = await updateRecipeWithCategories(
      recipeId,
      recipeData,
      categoryIds
    );

    if (success) {
      console.log(`Recipe updated successfully with ID: ${recipeId}`);
      navigation.reset({
        index: 0,
        routes: [
          { name: "Home" },
          { name: "RecipeDisplay", params: { recipeId: recipeId } },
        ],
      });
    } else {
      console.error("Failed to update recipe");
      throw new Error("Recipe update failed");
    }
  };

  const addNewRecipe = async (recipeData) => {
    console.log("Adding new recipe with data:", recipeData);
    const newRecipeId = await insertRecipeWithCategories(recipeData);
    console.log(`Recipe added successfully with ID: ${newRecipeId}`);
    navigation.reset({
      index: 0,
      routes: [
        { name: "Home" },
        { name: "RecipeDisplay", params: { recipeId: newRecipeId } },
      ],
    });
  };

  const handleSaveRecipe = async () => {
    if (isRecipeEmpty()) {
      showEmptyRecipeAlert();
      return;
    }

    try {
      const categoryIds = await handleCategorySelection();
      const formattedRecipeData = formatRecipeData(
        title,
        ingredients,
        instructions,
        totalTime,
        recipeImage || defaultImage,
        categoryIds
      );

      if (recipeId) {
        await updateExistingRecipe(recipeId, formattedRecipeData, categoryIds);
      } else {
        await addNewRecipe(formattedRecipeData);
      }
    } catch (error) {
      console.error("An error occurred while saving the recipe:", error);
    }
  };

  function takeImageHandler(imageUri) {
    setRecipeImage(imageUri);
  }

  // Ingredient Functions

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
      updatedUnit = formatUnit(updatedQuantity, updatedUnit);

      const newIngredient = {
        name: ingredientName,
        quantity:
          updatedQuantity % 1 === 0
            ? updatedQuantity.toString()
            : updatedQuantity.toFixed(2),
        unit: updatedUnit,
        department: selectedDepartment,
      };

      setIngredients((currentIngredients) => [
        ...(Array.isArray(currentIngredients) ? currentIngredients : []),
        newIngredient,
      ]);
      resetIngredientInputs();
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

  const formatIngredients = (ingredientsInput) => {
    const ingredientsArray =
      typeof ingredientsInput === "string"
        ? JSON.parse(ingredientsInput)
        : ingredientsInput;

    return ingredientsArray.map((ingredient, index) => {
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

  const resetIngredientInputs = () => {
    setIngredientName("");
    setQuantity("");
    setSelectedUnit(unitOptions[0].value);
    setSelectedDepartment(departments[0].name);
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
          <Text style={styles.title}>מרכיבים</Text>
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
            <View style={styles.unitPickerContainer}>
              <Picker
                selectedValue={selectedUnit}
                onValueChange={(itemValue) => setSelectedUnit(itemValue)}
                style={styles.unitPicker}
                itemStyle={styles.pickerItemStyle}
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
            <View style={styles.departmentPickerContainer}>
              <Picker
                selectedValue={selectedDepartment}
                onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
                style={styles.departmentPicker}
                itemStyle={styles.pickerItemStyle}
              >
                {departments.map((department) => (
                  <Picker.Item
                    key={department.name}
                    label={department.name}
                    value={department.name}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <SecondaryButton
            title="הוסף עוד"
            onPress={addIngredientHandler}
            style={styles.addButton}
          >
            <Ionicons name="add" size={wp("8%")} style={styles.addButtonIcon} />
          </SecondaryButton>
        </View>
        <View style={{ flexDirection: "row", marginBottom: hp("2%") }}>
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

        <PrimaryButton title="שמור מתכון" onPress={handleSaveRecipe} />
      </View>
    </KeyboardAwareScrollView>
  );
}

export default AddRecipeManuallyScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  form: {
    margin: wp("5%"),
  },
  title: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: colors.dark,
    textAlign: "left",
    marginBottom: hp("1%"),
    alignSelf: "flex-end",
    width: "100%",
  },
  ingredientSection: {
    marginBottom: hp("2%"),
    justifyContent: "flex-end",
  },
  ingredientInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: hp("1%"),
  },
  ingredientInput: {
    flex: 1.5,
    borderWidth: 1,
    borderRadius: wp("2.5%"),
    borderColor: colors.light,
    paddingVertical: hp("1.5%"),
    fontSize: wp("4%"),
    textAlign: "center",
    marginRight: wp("2%"),
  },
  quantityInput: {
    flex: 0.8,
    borderWidth: 1,
    borderRadius: wp("2.5%"),
    borderColor: colors.light,
    paddingVertical: hp("1.5%"),
    fontSize: wp("4%"),
    width: wp("12%"),
    textAlign: "center",
    marginRight: wp("2%"),
  },
  unitPickerContainer: {
    flex: 2,
    borderRadius: wp("2.5%"),
    borderColor: colors.light,
    overflow: "hidden",
  },
  departmentPickerContainer: {
    flex: 2.8,
    borderRadius: wp("2.5%"),
    borderColor: colors.light,
    overflow: "hidden",
  },
  unitPicker: {
    height: hp("5%"),
    justifyContent: "center",
  },
  departmentPicker: {
    height: hp("5%"),
    justifyContent: "center",
  },
  pickerItemStyle: {
    fontSize: wp("4%"),
    color: "#4f4d4d",
  },
  addButton: {
    flexDirection: "row-reverse",
    alignSelf: "center",
    width: "auto",
    marginTop: hp("2%"),
  },
  addButtonIcon: {
    color: colors.secondaryGreen,
    fontSize: wp("5.5%"),
    paddingRight: wp("2%"),
  },
  ingredientListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.lightGray,
    paddingVertical: hp("1.5%"),
    paddingHorizontal: wp("3"),
    marginVertical: hp("1%"),
    borderRadius: wp("2%"),
  },
  ingredientText: {
    fontSize: wp("4%"),
    color: colors.customGray,
    textAlign: "right",
    paddingRight: wp("3%"),
  },
  editButton: {
    padding: wp("2%"),
    marginRight: wp("2%"),
  },
  deleteButton: {
    padding: wp("2%"),
  },
  categoryButton: {
    backgroundColor: "white",
    padding: wp("2.5%"),
    borderRadius: wp("2.5%"),
    marginBottom: hp("2.5%"),
    borderColor: colors.light,
    borderWidth: 1,
    elevation: 1,
    shadowColor: colors.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: hp("7%"),
    justifyContent: "center",
    alignItems: "right",
  },
  categoryButtonText: {
    fontSize: wp("4%"),
    color: "#838181a8",
    textAlign: "right",
  },
});
