import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { insertRecipeWithCategories } from "../util/database";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import PrimaryButton from "../components/UI/PrimaryButton";
import LoadingOverlay from "../components/UI/LoadingOverlay";

function AddRecipeByUrlScreen({ navigation }) {
  const [recipeUrl, setRecipeUrl] = useState("");
  const [detectedText, setDetectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveRecipe = async () => {
    console.log("URL submitted:", recipeUrl);
    try {
      if (!recipeUrl) {
        Alert.alert("שגיאה", "אנא הזן קישור למתכון", [{ text: "אישור" }]);
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
        alert("שגיאה בהוספת המתכון: כותרת המתכון חסרה");
        return;
      }
      // Validate ingredients format
      if (
        !Array.isArray(detectedText.ingredients) ||
        detectedText.ingredients.length === 0
      ) {
        console.error("Invalid ingredients format or no ingredients found");
        alert("שגיאה בהוספת המתכון: נתוני המתכון לא תקינים");
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
        }
      };
      insertRecipe();
    }
  }, [detectedText, navigation]);

  const showSupportedSites = () => {
    Alert.alert(
      "רשימת אתרים נתמכים",
      "\n- 10 דקות\n- אליטה אופק\n- עדיקוש\n- ענת אלישע\n- דניאל עמית\n- השולחן\n- לייזה פאנלים\n- רחלי Krutit\n- שירי עמית  ",
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
          size={30}
          padding={10}
          color="black"
          onPress={showSupportedSites}
          style={styles.infoIcon}
        />
      </View>
      <PrimaryButton
        title="שמור מתכון"
        onPress={handleSaveRecipe}
        style={styles.button}
      />

      {loading && <LoadingOverlay message="מייבא מתכון..." />}
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
    padding: 10,
  },
  elementContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  form: {
    flex: 1,
    marginTop: 10,
    marginLeft: 10,
    paddingLeft: 10,
  },
  infoIcon: {
    flex: 0.1,
    marginTop: 5,
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
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 20,
  },
});
