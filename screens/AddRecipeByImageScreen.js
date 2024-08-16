import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import ImagePicker from "../components/UI/ImagePicker";
import { readAsStringAsync, EncodingType } from "expo-file-system";
import { insertRecipeWithCategories } from "../util/database";
import axios from "axios";
import { Alert } from "react-native";
import PrimaryButton from "../components/UI/PrimaryButton";

function AddRecipeByImageScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [detectedText, setDetectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveImage = async () => {
    if (!imageUri) {
      Alert.alert("שגיאה", "אנא בחר תמונה להעלאה", [{ text: "אישור" }]);
      return;
    }

    const base64Image = await readAsStringAsync(imageUri, {
      encoding: EncodingType.Base64,
    });

    try {
      setLoading(true);

      const response = await axios.post(
        "https://ilwcjy1wk4.execute-api.us-east-1.amazonaws.com/dev/",
        {
          image_data: String(base64Image),
        }
      );

      try {
        if (response.data.statusCode !== 200) {
          Alert.alert(
            "שגיאה",
            "התמונה לא זוהתה כתמונת מתכון. נסה שנית או הכנס את המתכון באופן ידני.",
            [
              {
                text: "אישור",
                onPress: () => {
                  setLoading(false);
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  });
                },
              },
            ],
            { cancelable: false }
          );
          return;
        }
        const data = JSON.parse(response.data.body);
        const resultString = data.result
          .replace(/\\n/g, "")
          .replace(/\\"/g, '"')
          .replace(/(\d+):/g, '"$1":');
        const detectedJson = JSON.parse(resultString);
        if (detectedJson.Ingredients) {
          detectedJson.ingredients = detectedJson.Ingredients;
          delete detectedJson.Ingredients;
        }
        setDetectedText(detectedJson);
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setLoading(false);
        return;
      }
    } catch (error) {
      setLoading(false);
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

      // Insert the recipe data into the database
      const insertRecipe = async () => {
        const recipeData = {
          title: detectedText.title,
          ingredients: detectedText.ingredients,
          instructions: detectedText.instructions,
          imageUri: imageUri,
          totalTime:
            detectedText["totalTime"] === "0 דקות"
              ? "לא צוין"
              : detectedText["totalTime"],
        };
        try {
          const newRecipeId = await insertRecipeWithCategories(recipeData);
          console.log(`Recipe added successfully with ID: ${newRecipeId}`);
          navigation.reset({
            index: 0,
            routes: [
              { name: "Home" },
              {
                name: "RecipeDisplay",
                params: { recipeId: newRecipeId },
              },
            ],
          });
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
          style={{ width: 370, height: 600, marginTop: 30 }}
        />
      </View>
      <PrimaryButton
        title="שמור מתכון"
        onPress={handleSaveImage}
        style={styles.button}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4db384" />
          <Text style={styles.loadingText}>מעלה את התמונה...</Text>
        </View>
      )}
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
    paddingHorizontal: 20,
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
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
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
