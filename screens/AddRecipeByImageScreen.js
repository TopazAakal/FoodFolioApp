import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ImagePicker from "../components/UI/ImagePicker";
import CustomButton from "../components/UI/CustomButton";
import { readAsStringAsync, EncodingType } from "expo-file-system";
import { insertRecipeWithCategories } from "../util/database";
import axios from "axios";

function AddRecipeByImageScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [detectedText, setDetectedText] = useState("");

  const handleSaveImage = async () => {
    const base64Image = await readAsStringAsync(imageUri, {
      encoding: EncodingType.Base64,
    });
    try {
      if (!imageUri) {
        alert("Please pick an image first.");
        return;
      }
      const response = await axios.post(
        "https://ilwcjy1wk4.execute-api.us-east-1.amazonaws.com/dev/",
        {
          image_data: String(base64Image),
        }
      );

      try {
        console.log("Response data:", response.data.body);

        let jsonString = JSON.parse(response.data.body);

        jsonString = jsonString.result
          .replace(/^```json/, "")
          .replace(/```$/, "");

        jsonString = jsonString.replace(/(\d+):/g, '"$1":');

        console.log("Cleaned jsonString:", jsonString);

        const detectedJson = JSON.parse(jsonString);

        if (detectedJson.Ingredients) {
          detectedJson.ingredients = detectedJson.Ingredients;
          delete detectedJson.Ingredients;
        }

        setDetectedText(detectedJson);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (detectedText) {
      console.log("Detected Text:", detectedText);

      // Check for required fields
      if (!detectedText.title) {
        console.error("Recipe title is missing");
        alert("Failed to save recipe: title is missing.");
        return;
      }

      // Validate ingredients format
      if (
        !Array.isArray(detectedText.ingredients) ||
        detectedText.ingredients.length === 0
      ) {
        console.error("Invalid ingredients format or no ingredients found");
        alert(
          "Failed to save recipe: invalid ingredients format or no ingredients found."
        );
        return;
      }

      // Log each ingredient for debugging
      detectedText.ingredients.forEach((ingredient, index) => {
        console.log(`Ingredient ${index + 1}:`, ingredient);
      });

      // Insert the recipe data into the database
      const insertRecipe = async () => {
        const recipeData = {
          title: detectedText.title,
          ingredients: detectedText.ingredients,
          instructions: detectedText.instructions,
          imageUri: imageUri,
          totaltime: detectedText.time,
        };
        try {
          const newRecipeId = await insertRecipeWithCategories(recipeData);
          console.log(`Recipe added successfully with ID: ${newRecipeId}`);

          navigation.navigate("Home", {});
        } catch (error) {
          console.error("Error inserting recipe:", error);
          // Handle database insertion error
        }
      };
      insertRecipe();
    }
  }, [detectedText, navigation]);

  return (
    <KeyboardAwareScrollView
      style={styles.rootContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.form}>
        <ImagePicker
          image={imageUri}
          onTakeImage={setImageUri}
          style={styles.imagePickerStyle}
        />
      </View>
      <CustomButton
        title="שמור מתכון"
        onPress={handleSaveImage}
        style={styles.button}
      />
    </KeyboardAwareScrollView>
  );
}

export default AddRecipeByImageScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  form: {
    margin: 20,
    flex: 1,
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  button: {
    alignSelf: "center",
  },
  imagePickerStyle: {
    height: 500,
  },
});
