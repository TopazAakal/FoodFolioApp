import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import CustomButton from "../components/UI/CustomButton";
import { insertRecipeWithCategories } from "../util/database";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

function AddRecipeByUrlScreen({ navigation }) {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [detectedText, setDetectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveRecipe = async () => {
    console.log("URL submitted:", recipeUrl);
    try {
      if (!recipeUrl) {
        alert("Please insert an URL first.");
        return;
      }
      setLoading(true);
      const response = await axios.post(
        "https://ilwcjy1wk4.execute-api.us-east-1.amazonaws.com/dev/",
        {
          URL: String(recipeUrl),
        }
      );
      try {
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
      console.error("Error fetching data:", error);
      setLoading(false);
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
          totalTime:
            detectedText["total time"] === "undefined"
              ? "לא צוין"
              : detectedText["total time"],
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

  const showSupportedSites = () => {
    Alert.alert(
      "אתרים נתמכים",
      "רשימת האתרים הנתמכים:\n- 10 דקות\n- אליטה אופק\n- עדיקוש\n- ענת אלישע\n- דניאל עמית\n- השולחן\n- לייזה פאנלים\n- רחלי קרוט\n- שירי עמית  ",
      [{ text: "סגור", style: "cancel" }]
    );
  };

  return (
    <KeyboardAwareScrollView
      style={styles.rootContainer}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.elementContainer}>
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
        <MaterialIcons
          styles={styles.infoIcon}
          name="info-outline"
          size={28}
          padding={10}
          color="black"
          onPress={showSupportedSites}
          style={styles.infoIcon}
        />
      </View>
      <CustomButton
        title="שמור מתכון"
        onPress={handleSaveRecipe}
        style={styles.button}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4db384" />
          <Text style={styles.loadingText}>מביא את המתכון...</Text>
        </View>
      )}
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
  elementContainer: {
    flexDirection: "row",
  },
  form: {
    flex: 1,
    marginTop: 10,
    marginLeft: 10,
    paddingLeft: 10,
  },
  infoIcon: {
    flex: 0.1,
    marginTop: 10,
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
