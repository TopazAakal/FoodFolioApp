import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomButton from "../components/UI/CustomButton";

function AddRecipeByUrlScreen() {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [detectedText, setDetectedText] = useState("");

  const handleSaveRecipe = async () => {
    console.log("URL submitted:", recipeUrl);
    try {
      if (!recipeUrl) {
        alert("Please insert an URL first.");
        return;
      }
      const response = await axios.post(
        "https://ilwcjy1wk4.execute-api.us-east-1.amazonaws.com/dev/",
        {
          URL: String(recipeUrl),
        }
      );
      detectedText = JSON.parse(response.data.body);
      setDetectedText(detectedText);

      console.log("Recipe:", detectedText);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
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
        <TextInput
          style={styles.input}
          placeholder="הזן קישור למתכון"
          value={recipeUrl}
          onChangeText={setRecipeUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>
      <CustomButton
        title="שמור מתכון"
        onPress={handleSaveRecipe}
        style={styles.button}
      />
    </KeyboardAwareScrollView>
  );
}

export default AddRecipeByUrlScreen;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  form: {
    margin: 20,
    paddingHorizontal: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 7,
    fontSize: 16,
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 15,
    textAlign: "right",
  },
  button: {
    alignSelf: "center",
  },
});
